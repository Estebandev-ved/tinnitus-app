package com.tinnitus.backend.controller;

import com.tinnitus.backend.model.entity.TelemetryLog;
import com.tinnitus.backend.service.TelemetryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST de telemetría para registrar eventos y dispositivos.
 * Los endpoints de escritura no requieren autenticación estricta para
 * permitir el registro temprano de dispositivos.
 */
@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryController {

    @Autowired
    private TelemetryService telemetryService;

    @PostMapping("/device")
    public ResponseEntity<TelemetryLog> logDeviceRegistration(
            @RequestParam String userId,
            @RequestParam String platform,
            @RequestParam String deviceId,
            @RequestParam String appVersion,
            @RequestParam(required = false) String deviceInfo) {

        return ResponseEntity.ok(
                telemetryService.logDeviceRegistration(
                        null, platform, deviceId, appVersion, deviceInfo)
        );
    }

    @PostMapping("/event")
    public ResponseEntity<TelemetryLog> logEvent(
            @RequestParam String eventType,
            @RequestParam String platform,
            @RequestParam String appVersion,
            @RequestParam(required = false) String deviceInfo,
            @RequestParam(required = false) String sessionId) {
        return ResponseEntity.ok(
                telemetryService.logEvent(null, eventType, platform, appVersion, deviceInfo, sessionId)
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getTelemetrySummary() {
        long totalEvents = telemetryService.getEventCountByType("any");
        long deviceRegs = telemetryService.getEventCountByType("device_registration");
        return ResponseEntity.ok(Map.of(
                "totalEvents", totalEvents,
                "deviceRegistrations", deviceRegs
        ));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TelemetryLog>> getRecentEvents(@RequestParam int limit) {
        List<TelemetryLog> events = telemetryService.getRecentEvents(limit);
        return ResponseEntity.ok(events);
    }
}