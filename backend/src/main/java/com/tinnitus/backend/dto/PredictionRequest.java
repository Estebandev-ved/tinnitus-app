package com.tinnitus.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record PredictionRequest(
    @NotBlank String patientId,
    String email,
    String username,
    String firebaseId,
    Integer riskScore,
    String riskLevel,
    String predictedWindow,
    String topFactors,
    String preventionActions,
    String createdAt
) {}
