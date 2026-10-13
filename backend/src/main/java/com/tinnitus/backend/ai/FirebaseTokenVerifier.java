package com.tinnitus.backend.ai;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Component;

import java.util.Optional;

/** Verifica ID tokens de Firebase con Firebase Admin (firma, expiración, audiencia). */
@Component
public class FirebaseTokenVerifier {

    /** true si Firebase Admin está inicializado (FIREBASE_SA_JSON o FIREBASE_SA configurado). */
    public boolean isAvailable() {
        return !FirebaseApp.getApps().isEmpty();
    }

    /** Identidad verificada extraída de un ID token (nunca de datos enviados por el cliente). */
    public record VerifiedUser(String uid, String email, boolean emailVerified, String name) {}

    /** @return claims verificados (firma, expiración, audiencia) o vacío si el token es inválido. */
    public Optional<VerifiedUser> verifyClaims(String idToken) {
        try {
            FirebaseToken t = FirebaseAuth.getInstance().verifyIdToken(idToken);
            return Optional.of(new VerifiedUser(t.getUid(), t.getEmail(), t.isEmailVerified(), t.getName()));
        } catch (FirebaseAuthException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    /** @return el uid si el token es válido; vacío si es inválido o expiró. */
    public Optional<String> verify(String idToken) {
        try {
            return Optional.of(FirebaseAuth.getInstance().verifyIdToken(idToken).getUid());
        } catch (FirebaseAuthException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
