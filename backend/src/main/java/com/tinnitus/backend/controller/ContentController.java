package com.tinnitus.backend.controller;

import com.tinnitus.backend.model.entity.ContentItem;
import com.tinnitus.backend.model.entity.ContentStatus;
import com.tinnitus.backend.model.entity.ContentType;
import com.tinnitus.backend.repository.ContentItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
public class ContentController {

    @Autowired
    private ContentItemRepository repo;

    @GetMapping
    public List<ContentItem> published(@RequestParam(required = false) String type,
                                       @RequestParam(required = false) String lang) {
        if (type != null && lang != null) {
            return repo.findByTypeAndStatusAndLanguage(ContentType.valueOf(type), ContentStatus.PUBLISHED, lang);
        }
        if (type != null) {
            return repo.findByTypeAndStatus(ContentType.valueOf(type), ContentStatus.PUBLISHED);
        }
        if (lang != null) {
            return repo.findByLanguageAndStatus(lang, ContentStatus.PUBLISHED);
        }
        return repo.findByStatus(ContentStatus.PUBLISHED);
    }
}
