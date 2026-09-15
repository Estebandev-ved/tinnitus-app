package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.ProgressNote;
import java.time.LocalDateTime;

public record ProgressNoteResponse(
    Long id,
    String text,
    String mood,
    LocalDateTime date,
    String aiAnalysis,
    LocalDateTime createdAt
) {
    public static ProgressNoteResponse from(ProgressNote p) {
        return new ProgressNoteResponse(
            p.getId(), p.getText(), p.getMood(),
            p.getDate(), p.getAiAnalysis(), p.getCreatedAt()
        );
    }
}
