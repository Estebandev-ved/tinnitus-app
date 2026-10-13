package com.tinnitus.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

/**
 * Inicializa Firebase Admin a partir de una cuenta de servicio. Orden de busqueda:
 * <ol>
 *   <li>{@code FIREBASE_SA_JSON}: contenido JSON de la cuenta de servicio (o ese mismo JSON en base64).
 *       Pensado para plataformas sin archivos (Railway).</li>
 *   <li>{@code FIREBASE_SA}: ruta a un archivo JSON (Docker con volumen, desarrollo local).</li>
 *   <li>{@code GOOGLE_APPLICATION_CREDENTIALS}: ruta a un archivo JSON.</li>
 * </ol>
 * Si no hay ninguna, queda sin configurar y el push opera en modo no-op (no rompe el arranque).
 * SECURITY: nunca se escribe el contenido de la credencial en logs.
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.sa-json:}")
    private String saJson;

    @Value("${firebase.sa-path:}")
    private String saPath;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        if (!FirebaseApp.getApps().isEmpty()) {
            initialized = true;
            return;
        }
        try {
            byte[] credentials = resolveCredentialBytes(saJson, saPath, System.getenv("GOOGLE_APPLICATION_CREDENTIALS"));
            if (credentials == null) {
                log.warn("[Firebase] Sin cuenta de servicio (FIREBASE_SA_JSON / FIREBASE_SA). Push FCM y login Firebase del backend deshabilitados.");
                return;
            }
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(credentials)))
                    .build();
            FirebaseApp.initializeApp(options);
            initialized = true;
            log.info("[Firebase] Inicializado correctamente.");
        } catch (IOException | RuntimeException e) {
            // Solo el tipo de error: el mensaje podria contener fragmentos de la credencial.
            log.error("[Firebase] Error al inicializar la cuenta de servicio ({}). Firebase deshabilitado.",
                    e.getClass().getSimpleName());
        }
    }

    /**
     * Resuelve los bytes de la credencial. Visible para tests.
     *
     * @return bytes del JSON, o {@code null} si no hay ninguna fuente configurada
     * @throws IOException si hay una ruta configurada pero no se puede leer
     */
    static byte[] resolveCredentialBytes(String json, String path, String googleAppCredentials) throws IOException {
        if (json != null && !json.isBlank()) {
            String trimmed = json.trim();
            if (trimmed.startsWith("{")) {
                return trimmed.getBytes(StandardCharsets.UTF_8);
            }
            try {
                byte[] decoded = Base64.getMimeDecoder().decode(trimmed);
                if (new String(decoded, StandardCharsets.UTF_8).trim().startsWith("{")) {
                    return decoded;
                }
            } catch (IllegalArgumentException ignored) {
                // cae al error generico de abajo (sin incluir el valor)
            }
            throw new IOException("FIREBASE_SA_JSON no es JSON ni base64 de un JSON");
        }
        String filePath = (path != null && !path.isBlank()) ? path : googleAppCredentials;
        if (filePath != null && !filePath.isBlank()) {
            return Files.readAllBytes(Path.of(filePath.trim()));
        }
        return null;
    }

    public boolean isInitialized() {
        return initialized;
    }
}
