package com.tinnitus.backend.filter;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Protege los endpoints de sincronización máquina-a-máquina (app móvil -> backend)
 * mediante un token de servicio compartido enviado en la cabecera `X-Clinical-Token`.
 *
 * Rutas protegidas:
 *   - /api/v1/clinical/**   (pacientes, THI, audiometrías, dispositivos, telemetría)
 *   - /api/v1/telemetry/**  (registro de eventos/dispositivos)
 *
 * Si `clinical.sync-token` no está configurado, el filtro usa el token de
 * desarrollo por defecto `dev-clinical-token` (debe coincidir con
 * VITE_CLINICAL_SYNC_TOKEN de la app móvil). En producción SIEMPRE debe
 * definirse la variable de entorno CLINICAL_SYNC_TOKEN con un secreto fuerte.
 */
@Component
public class ClinicalSyncFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ClinicalSyncFilter.class);
    private static final String HEADER = "X-Clinical-Token";
    private static final String DEV_DEFAULT = "dev-clinical-token";

    @Value("${clinical.sync-token:}")
    private String expectedToken;

    @PostConstruct
    void init() {
        if (expectedToken == null || expectedToken.isBlank()) {
            expectedToken = DEV_DEFAULT;
            log.warn("CLINICAL_SYNC_TOKEN no configurado: usando token de desarrollo '{}'. Defínelo con un secreto fuerte en producción.", DEV_DEFAULT);
        } else {
            log.info("ClinicalSyncFilter activo: /api/v1/clinical/** y /api/v1/telemetry/** requieren X-Clinical-Token.");
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        boolean secured = uri.startsWith("/api/v1/clinical/") || uri.startsWith("/api/v1/telemetry/");

        if (secured) {
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }
            String token = request.getHeader(HEADER);
            if (token == null || !token.equals(expectedToken)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token de sincronización inválido o ausente\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
