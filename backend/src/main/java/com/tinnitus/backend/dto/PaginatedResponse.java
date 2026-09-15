package com.tinnitus.backend.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Wrapper genérico para respuestas paginadas.
 */
public record PaginatedResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return new PaginatedResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
}
