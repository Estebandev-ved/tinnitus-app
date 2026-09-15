package com.tinnitus.backend.controller;

import com.tinnitus.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/signups")
    public ResponseEntity<List<Map<String, Object>>> signups(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.signupsSeries(days));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<Map<String, Object>>> activity(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.activitySeries(days));
    }

    @GetMapping("/thi")
    public ResponseEntity<Map<String, Object>> thi(@RequestParam(defaultValue = "90") int days) {
        return ResponseEntity.ok(analyticsService.thiTrends(days));
    }

    @GetMapping("/audiometry")
    public ResponseEntity<List<Map<String, Object>>> audiometry() {
        return ResponseEntity.ok(analyticsService.audiometryByFrequency());
    }

    @GetMapping("/adherence")
    public ResponseEntity<Map<String, Object>> adherence() {
        return ResponseEntity.ok(analyticsService.adherence());
    }

    @GetMapping("/engagement")
    public ResponseEntity<Map<String, Object>> engagement() {
        return ResponseEntity.ok(analyticsService.engagement());
    }
}
