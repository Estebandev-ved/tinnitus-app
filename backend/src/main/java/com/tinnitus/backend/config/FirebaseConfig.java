package com.tinnitus.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Inicializa Firebase Admin a partir de una cuenta de servicio.
 * Si no hay FIREBASE_SA ni GOOGLE_APPLICATION_CREDENTIALS, queda sin configurar
 * y el servicio de push opera en modo no-op (no rompe el arranque).
 */
@Configuration
public class FirebaseConfig {

    @Value("${firebase.sa-path:${FIREBASE_SA:}}")
    private String saPath;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                InputStream sa = resolveStream();
                if (sa == null) {
                    System.out.println("[Firebase] No se encontró cuenta de servicio (FIREBASE_SA). Push FCM deshabilitado.");
                    return;
                }
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(sa))
                        .build();
                FirebaseApp.initializeApp(options);
                initialized = true;
                System.out.println("[Firebase] Inicializado correctamente. Push FCM habilitado.");
            } catch (IOException e) {
                System.out.println("[Firebase] Error al inicializar: " + e.getMessage() + ". Push FCM deshabilitado.");
            }
        } else {
            initialized = true;
        }
    }

    private InputStream resolveStream() throws IOException {
        String path = saPath;
        if (path == null || path.isBlank()) {
            path = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        }
        if (path != null && !path.isBlank()) {
            return new FileInputStream(path);
        }
        return null;
    }

    public boolean isInitialized() {
        return initialized;
    }
}
