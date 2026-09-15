package com.tinnitus.backend.controller;

import com.tinnitus.backend.model.entity.ContentItem;
import com.tinnitus.backend.model.entity.ContentStatus;
import com.tinnitus.backend.model.entity.ContentType;
import com.tinnitus.backend.repository.ContentItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/content")
public class ContentAdminController {

    @Autowired
    private ContentItemRepository repo;

    @GetMapping
    public List<ContentItem> list(@RequestParam(required = false) String type,
                                  @RequestParam(required = false) String status,
                                  @RequestParam(required = false) String lang) {
        if (type != null && status != null) {
            return repo.findByTypeAndStatus(ContentType.valueOf(type), ContentStatus.valueOf(status));
        }
        if (lang != null && status != null) {
            return repo.findByLanguageAndStatus(lang, ContentStatus.valueOf(status));
        }
        if (status != null) {
            return repo.findByStatus(ContentStatus.valueOf(status));
        }
        return repo.findAllByOrderBySortOrderAscIdAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentItem> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ContentItem> create(@RequestBody ContentItem item) {
        item.setId(null);
        return ResponseEntity.ok(repo.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentItem> update(@PathVariable Long id, @RequestBody ContentItem item) {
        return repo.findById(id).map(existing -> {
            item.setId(id);
            if (item.getCreatedAt() == null) item.setCreatedAt(existing.getCreatedAt());
            return ResponseEntity.ok(repo.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
