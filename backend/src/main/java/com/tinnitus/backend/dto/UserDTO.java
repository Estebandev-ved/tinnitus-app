package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.User;
import java.time.LocalDateTime;

/**
 * DTO para respuestas de usuario en el panel admin.
 * Evita exponer password y other sensitive fields.
 */
public record UserDTO(
    Long id,
    String username,
    String email,
    String role,
    boolean enabled,
    LocalDateTime createdAt,
    int deviceCount,
    int telemetryCount,
    int thiCount,
    int audiometryCount,
    int predictionCount,
    int voiceDiaryCount,
    int progressNoteCount
) {
    public static UserDTO from(User u, int thiCount, int audiometryCount,
                               int predictionCount, int voiceDiaryCount, int progressNoteCount) {
        return new UserDTO(
            u.getId(), u.getUsername(), u.getEmail(),
            u.getRole() != null ? u.getRole().getName() : null,
            u.isEnabled(), u.getCreatedAt(),
            u.getDevices() != null ? u.getDevices().size() : 0,
            u.getTelemetryLogs() != null ? u.getTelemetryLogs().size() : 0,
            thiCount, audiometryCount, predictionCount, voiceDiaryCount, progressNoteCount
        );
    }
}
