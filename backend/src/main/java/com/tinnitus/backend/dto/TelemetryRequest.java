package com.tinnitus.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record TelemetryRequest(
    @NotBlank String patientId,
    String email,
    String username,
    @NotBlank String eventType,
    @NotBlank String platform,
    String appVersion,
    String deviceInfo,
    String sessionId,
    String payload,
    String timestamp
) {}
