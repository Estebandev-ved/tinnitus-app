package com.tinnitus.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter simple basado en IP. Limita a MAX_REQUESTS por ventana de tiempo.
 * Retorna 429 Too Many Requests si se excede.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 100;
    private static final long WINDOW_MS = 60_000; // 1 minuto
    private final ConcurrentHashMap<String, LinkedList<Long>> requests = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String ip = request.getRemoteAddr();

        // Bypass rate limit for localhost (migration scripts, admin)
        if ("127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "localhost".equals(ip)) {
            filterChain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();

        LinkedList<Long> timestamps = requests.computeIfAbsent(ip, k -> new LinkedList<>());

        synchronized (timestamps) {
            timestamps.removeIf(t -> now - t > WINDOW_MS);
            if (timestamps.size() >= MAX_REQUESTS) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Too many requests\",\"retryAfter\":60}");
                return;
            }
            timestamps.add(now);
        }

        filterChain.doFilter(request, response);
    }
}
