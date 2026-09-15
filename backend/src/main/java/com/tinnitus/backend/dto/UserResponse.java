package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.User;

import java.time.LocalDateTime;

/**
 * DTO seguro para respuestas. Nunca incluye password.
 */
public record UserResponse(
    Long id,
    String username,
    String email,
    String role,
    boolean enabled,
    LocalDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
            u.getId(),
            u.getUsername(),
            u.getEmail(),
            u.getRole() != null ? u.getRole().getName() : null,
            u.isEnabled(),
            u.getCreatedAt()
        );
    }
}
