package com.tinnitus.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ProgressNoteRequest(
    @NotBlank String patientId,
    String email,
    String username,
    String text,
    String mood,
    String date,
    String aiAnalysis,
    String createdAt
) {}
