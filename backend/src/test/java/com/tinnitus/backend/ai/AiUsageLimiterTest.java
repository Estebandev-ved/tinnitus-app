package com.tinnitus.backend.ai;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiUsageLimiterTest {

    private static final class MutableClock extends Clock {
        final AtomicLong now = new AtomicLong(Instant.parse("2026-09-29T10:00:00Z").toEpochMilli());

        @Override public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return Instant.ofEpochMilli(now.get()); }
    }

    @Test
    void blocksAfterPerMinuteLimitAndRecovers() {
        MutableClock clock = new MutableClock();
        AiUsageLimiter limiter = new AiUsageLimiter(clock, 2, 100, 100_000);
        assertTrue(limiter.tryAcquire("u1").allowed());
        assertTrue(limiter.tryAcquire("u1").allowed());
        AiUsageLimiter.Decision blocked = limiter.tryAcquire("u1");
        assertFalse(blocked.allowed());
        assertEquals("minute", blocked.scope());
        clock.now.addAndGet(61_000);
        assertTrue(limiter.tryAcquire("u1").allowed());
    }

    @Test
    void blocksAfterDailyLimitPerUserOnly() {
        MutableClock clock = new MutableClock();
        AiUsageLimiter limiter = new AiUsageLimiter(clock, 100, 2, 100_000);
        limiter.tryAcquire("u1");
        limiter.tryAcquire("u1");
        AiUsageLimiter.Decision blocked = limiter.tryAcquire("u1");
        assertFalse(blocked.allowed());
        assertEquals("day", blocked.scope());
        assertTrue(limiter.tryAcquire("u2").allowed());
        clock.now.addAndGet(24L * 3600 * 1000);
        assertTrue(limiter.tryAcquire("u1").allowed());
    }

    @Test
    void tokenBudgetAndRelease() {
        AiUsageLimiter limiter = new AiUsageLimiter(new MutableClock(), 100, 100, 1000);
        limiter.tryAcquire("u1");
        limiter.recordTokens("u1", 1000);
        assertEquals("day", limiter.tryAcquire("u1").scope());

        AiUsageLimiter l2 = new AiUsageLimiter(new MutableClock(), 100, 1, 1000);
        l2.tryAcquire("u2");
        l2.release("u2");
        assertTrue(l2.tryAcquire("u2").allowed());
    }
}
