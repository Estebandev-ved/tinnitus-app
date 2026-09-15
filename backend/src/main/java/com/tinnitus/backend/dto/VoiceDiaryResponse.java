package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.VoiceDiary;
import java.time.LocalDateTime;

public record VoiceDiaryResponse(
    Long id,
    String transcript,
    String emotionalState,
    Integer stressScore,
    Boolean tinnitusWorseningRisk,
    String recommendedSound,
    String summary,
    String aiResponse,
    LocalDateTime createdAt
) {
    public static VoiceDiaryResponse from(VoiceDiary v) {
        return new VoiceDiaryResponse(
            v.getId(), v.getTranscript(), v.getEmotionalState(),
            v.getStressScore(), v.getTinnitusWorseningRisk(),
            v.getRecommendedSound(), v.getSummary(), v.getAiResponse(),
            v.getCreatedAt()
        );
    }
}
