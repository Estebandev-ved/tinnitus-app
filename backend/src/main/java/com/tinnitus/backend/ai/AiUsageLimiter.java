package com.tinnitus.backend.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayDeque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Límite de uso por usuario (uid de Firebase): mensajes por minuto, mensajes por día
 * y tokens por día. En memoria: válido para UNA instancia del backend (docker-compose).
 * Si se escala a varias instancias hay que mover los contadores a Redis/BD.
 */
@Component
public class AiUsageLimiter {

    public record Decision(boolean allowed, String scope, long retryAfterSeconds, int remainingToday) {
    }

    private static final class Usage {
        LocalDate day;
        int messages;
        long tokens;
        final ArrayDeque<Long> recent = new ArrayDeque<>();
    }

    private final ConcurrentHashMap<String, Usage> usage = new ConcurrentHashMap<>();
    private final Clock clock;
    private final int perMinute;
    private final int perDay;
    private final long tokensPerDay;

    @Autowired
    public AiUsageLimiter(@Value("${ai.limit.per-minute:6}") int perMinute,
                          @Value("${ai.limit.per-day:40}") int perDay,
                          @Value("${ai.limit.tokens-per-day:60000}") long tokensPerDay) {
        this(Clock.systemUTC(), perMinute, perDay, tokensPerDay);
    }

    AiUsageLimiter(Clock clock, int perMinute, int perDay, long tokensPerDay) {
        this.clock = clock;
        this.perMinute = perMinute;
        this.perDay = perDay;
        this.tokensPerDay = tokensPerDay;
    }

    /** Comprueba y, si procede, reserva un mensaje. */
    public Decision tryAcquire(String uid) {
        long now = clock.millis();
        LocalDate today = LocalDate.now(clock.withZone(ZoneOffset.UTC));
        purgeIfLarge(today);
        Usage u = usage.computeIfAbsent(uid, k -> new Usage());
        synchronized (u) {
            if (!today.equals(u.day)) {
                u.day = today;
                u.messages = 0;
                u.tokens = 0;
            }
            while (!u.recent.isEmpty() && now - u.recent.peekFirst() > 60_000) {
                u.recent.pollFirst();
            }
            if (u.messages >= perDay || u.tokens >= tokensPerDay) {
                long secondsToMidnight = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toEpochSecond() - now / 1000;
                return new Decision(false, "day", Math.max(secondsToMidnight, 1), 0);
            }
            if (u.recent.size() >= perMinute) {
                long wait = 60 - (now - u.recent.peekFirst()) / 1000;
                return new Decision(false, "minute", Math.max(wait, 1), perDay - u.messages);
            }
            u.recent.addLast(now);
            u.messages++;
            return new Decision(true, null, 0, perDay - u.messages);
        }
    }

    /** Suma los tokens realmente consumidos (respuesta de Azure). */
    public void recordTokens(String uid, long tokens) {
        Usage u = usage.get(uid);
        if (u != null && tokens > 0) {
            synchronized (u) {
                u.tokens += tokens;
            }
        }
    }

    /** Devuelve el mensaje reservado si la llamada a Azure falló (no penalizar al usuario). */
    public void release(String uid) {
        Usage u = usage.get(uid);
        if (u != null) {
            synchronized (u) {
                if (u.messages > 0) u.messages--;
                u.recent.pollLast();
            }
        }
    }

    private void purgeIfLarge(LocalDate today) {
        if (usage.size() > 5000) {
            usage.entrySet().removeIf(e -> e.getValue().day != null && e.getValue().day.isBefore(today));
        }
    }
}
