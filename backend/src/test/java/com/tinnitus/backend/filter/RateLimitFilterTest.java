package com.tinnitus.backend.filter;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RateLimitFilterTest {

    @Test
    void usesLastForwardedIpOnlyWhenTrusted() {
        assertEquals("9.9.9.9", RateLimitFilter.clientIp("10.0.0.1", "1.1.1.1, 9.9.9.9", true));
        assertEquals("10.0.0.1", RateLimitFilter.clientIp("10.0.0.1", "1.1.1.1, 9.9.9.9", false));
        assertEquals("10.0.0.1", RateLimitFilter.clientIp("10.0.0.1", null, true));
        assertEquals("10.0.0.1", RateLimitFilter.clientIp("10.0.0.1", " ", true));
    }
}
