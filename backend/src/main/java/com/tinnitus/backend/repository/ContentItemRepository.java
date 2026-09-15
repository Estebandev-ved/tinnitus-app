package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.ContentItem;
import com.tinnitus.backend.model.entity.ContentStatus;
import com.tinnitus.backend.model.entity.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentItemRepository extends JpaRepository<ContentItem, Long> {
    List<ContentItem> findByStatus(ContentStatus status);
    List<ContentItem> findByTypeAndStatus(ContentType type, ContentStatus status);
    List<ContentItem> findByLanguageAndStatus(String language, ContentStatus status);
    List<ContentItem> findByTypeAndStatusAndLanguage(ContentType type, ContentStatus status, String language);
    List<ContentItem> findAllByOrderBySortOrderAscIdAsc();
}
