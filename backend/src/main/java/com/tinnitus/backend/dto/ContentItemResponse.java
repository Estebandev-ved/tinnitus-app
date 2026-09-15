package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.ContentItem;
import java.time.LocalDateTime;

public record ContentItemResponse(
    Long id,
    String type,
    String title,
    String summary,
    String body,
    String status,
    String language,
    String tags,
    String imageUrl,
    String actionUrl,
    Integer sortOrder,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ContentItemResponse from(ContentItem c) {
        return new ContentItemResponse(
            c.getId(),
            c.getType() != null ? c.getType().name() : null,
            c.getTitle(), c.getSummary(), c.getBody(),
            c.getStatus() != null ? c.getStatus().name() : null,
            c.getLanguage(), c.getTags(),
            c.getImageUrl(), c.getActionUrl(), c.getSortOrder(),
            c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}
