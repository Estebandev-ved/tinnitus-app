package com.tinnitus.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record DeviceRequest(
    @NotBlank String patientId,
    String email,
    String username,
    @NotBlank String platform,
    @NotBlank String deviceId,
    String appVersion
) {}
