package com.tinnitus.backend.controller;

import com.tinnitus.backend.ai.AiChatRequest;
import com.tinnitus.backend.ai.AiConversationSanitizer;
import com.tinnitus.backend.ai.AiPromptBuilder;
import com.tinnitus.backend.ai.AiUsageLimiter;
import com.tinnitus.backend.ai.AzureChatClient;
import com.tinnitus.backend.ai.FirebaseTokenVerifier;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Proxy de IA. Se autentica con un ID token de Firebase (cabecera Authorization: Bearer),
 * verificado aquí con Firebase Admin; no depende del JWT propio del backend.
 * Nunca se loguea el contenido de los mensajes (datos de salud).
 */
@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI", description = "Proxy del asistente de IA (Azure OpenAI)")
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);

    private final FirebaseTokenVerifier verifier;
    private final AiUsageLimiter limiter;
    private final AiPromptBuilder promptBuilder;
    private final AzureChatClient azure;

    public AiController(FirebaseTokenVerifier verifier, AiUsageLimiter limiter,
                        AiPromptBuilder promptBuilder, AzureChatClient azure) {
        this.verifier = verifier;
        this.limiter = limiter;
        this.promptBuilder = promptBuilder;
        this.azure = azure;
    }

    @PostMapping("/chat")
    @Operation(summary = "Enviar un mensaje al asistente de IA (requiere ID token de Firebase)")
    public ResponseEntity<Map<String, Object>> chat(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody AiChatRequest request) {

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Inicia sesión para usar el asistente.");
        }
        if (!azure.isConfigured() || !verifier.isAvailable()) {
            return error(HttpStatus.SERVICE_UNAVAILABLE, "AI_UNAVAILABLE", "El asistente no está disponible ahora.");
        }
        String uid = verifier.verify(authorization.substring(7)).orElse(null);
        if (uid == null) {
            return error(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Sesión inválida o expirada.");
        }

        List<Map<String, String>> turns;
        try {
            turns = AiConversationSanitizer.toTurns(request.history(), request.message());
        } catch (AiConversationSanitizer.InvalidHistoryException e) {
            return error(HttpStatus.BAD_REQUEST, "INVALID_HISTORY", e.getMessage());
        }

        AiUsageLimiter.Decision d = limiter.tryAcquire(uid);
        if (!d.allowed()) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("error", "AI_LIMIT_REACHED");
            body.put("scope", d.scope());
            body.put("retryAfterSeconds", d.retryAfterSeconds());
            body.put("message", "day".equals(d.scope())
                    ? "Alcanzaste el límite diario del asistente. Vuelve mañana."
                    : "Estás escribiendo muy rápido. Espera unos segundos.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(d.retryAfterSeconds())).body(body);
        }

        try {
            AzureChatClient.Completion c = azure.complete(promptBuilder.build(request.context()), turns);
            if (c.text().isBlank()) {
                limiter.release(uid);
                return error(HttpStatus.BAD_GATEWAY, "AI_EMPTY", "El asistente no pudo responder. Inténtalo de nuevo.");
            }
            limiter.recordTokens(uid, c.totalTokens());
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("reply", c.text());
            body.put("remainingToday", d.remainingToday());
            return ResponseEntity.ok(body);
        } catch (RuntimeException e) {
            limiter.release(uid);
            // Sin contenido del usuario ni detalles del proveedor en el log.
            log.warn("AI upstream failure: {}", e.getClass().getSimpleName());
            return error(HttpStatus.BAD_GATEWAY, "AI_UPSTREAM_ERROR", "El asistente no está disponible ahora.");
        }
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of("error", code, "message", message));
    }
}
