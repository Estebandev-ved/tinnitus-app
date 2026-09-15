package com.tinnitus.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record VoiceDiaryRequest(
    @NotBlank String patientId,
    String email,
    String username,
    String transcript,
    String emotionalState,
    Integer stressScore,
    Boolean tinnitusWorseningRisk,
    String recommendedSound,
    String summary,
    String aiResponse,
    String createdAt
) {}
