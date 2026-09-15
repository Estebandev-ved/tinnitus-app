package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.Prediction;
import java.time.LocalDateTime;

public record PredictionDTO(
    Long id,
    Integer riskScore,
    String riskLevel,
    String predictedWindow,
    String topFactors,
    String preventionActions,
    LocalDateTime createdAt
) {
    public static PredictionDTO from(Prediction p) {
        return new PredictionDTO(
            p.getId(), p.getRiskScore(), p.getRiskLevel(),
            p.getPredictedWindow(), p.getTopFactors(), p.getPreventionActions(),
            p.getCreatedAt()
        );
    }
}
