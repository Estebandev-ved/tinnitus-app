package com.tinnitus.backend.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Bloqueo de cuenta por intentos fallidos de login.
 * In-memory por simplicidad; en producción usar Redis.
 * Bloquea por 15 minutos después de 5 intentos fallidos.
 */
@Service
public class AccountLockoutService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

    private final ConcurrentHashMap<String, FailedAttempt> attempts = new ConcurrentHashMap<>();

    public boolean isLocked(String key) {
        FailedAttempt fa = attempts.get(key);
        if (fa == null) return false;
        if (System.currentTimeMillis() - fa.lastAttempt > LOCKOUT_DURATION_MS) {
            attempts.remove(key);
            return false;
        }
        return fa.count >= MAX_ATTEMPTS;
    }

    public void recordFailure(String key) {
        attempts.compute(key, (k, existing) -> {
            if (existing == null || System.currentTimeMillis() - existing.lastAttempt > LOCKOUT_DURATION_MS) {
                return new FailedAttempt(1, System.currentTimeMillis());
            }
            return new FailedAttempt(existing.count + 1, System.currentTimeMillis());
        });
    }

    public void clearFailures(String key) {
        attempts.remove(key);
    }

    public int getRemainingAttempts(String key) {
        FailedAttempt fa = attempts.get(key);
        if (fa == null || System.currentTimeMillis() - fa.lastAttempt > LOCKOUT_DURATION_MS) {
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - fa.count);
    }

    private static class FailedAttempt {
        final int count;
        final long lastAttempt;

        FailedAttempt(int count, long lastAttempt) {
            this.count = count;
            this.lastAttempt = lastAttempt;
        }
    }
}
