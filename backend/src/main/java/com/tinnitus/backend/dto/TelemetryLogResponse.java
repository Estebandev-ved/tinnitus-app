package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.TelemetryLog;
import java.time.LocalDateTime;

public record TelemetryLogResponse(
    Long id,
    String eventType,
    String platform,
    String appVersion,
    String sessionId,
    LocalDateTime timestamp
) {
    public static TelemetryLogResponse from(TelemetryLog t) {
        return new TelemetryLogResponse(
            t.getId(), t.getEventType(), t.getPlatform(),
            t.getAppVersion(), t.getSessionId(), t.getTimestamp()
        );
    }
}
