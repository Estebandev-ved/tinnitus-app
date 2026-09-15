package com.tinnitus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ThiRequest(
    @NotBlank String patientId,
    String email,
    String username,
    @NotNull Integer total,
    @NotBlank String grade,
    Integer functional,
    Integer emotional,
    Integer catastrophic,
    String answers,
    String createdAt
) {}
