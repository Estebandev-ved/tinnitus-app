package com.tinnitus.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AudiometryRequest(
    @NotBlank String patientId,
    String email,
    String username,
    String type,
    Double frequency,
    Integer volume,
    String ear,
    String measuredAt
) {}
