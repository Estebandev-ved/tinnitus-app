package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.Audiometry;
import java.time.LocalDateTime;

public record AudiometryResponse(
    Long id,
    String type,
    Double frequency,
    Integer volume,
    String ear,
    LocalDateTime measuredAt
) {
    public static AudiometryResponse from(Audiometry a) {
        return new AudiometryResponse(
            a.getId(), a.getType(), a.getFrequency(),
            a.getVolume(), a.getEar(), a.getMeasuredAt()
        );
    }
}
