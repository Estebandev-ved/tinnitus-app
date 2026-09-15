package com.tinnitus.backend.controller;

import com.tinnitus.backend.service.PushService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/push")
@PreAuthorize("hasRole('ADMIN')")
public class PushController {

    private final PushService pushService;

    public PushController(PushService pushService) {
        this.pushService = pushService;
    }

    @PostMapping
    public ResponseEntity<?> send(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String body = payload.get("body");
        String segment = payload.getOrDefault("segment", "all");
        if (title == null || title.isBlank() || body == null || body.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "title y body son requeridos"));
        }
        return ResponseEntity.ok(pushService.sendToSegment(segment, title, body));
    }

    @GetMapping("/preview")
    public ResponseEntity<?> preview(@RequestParam(defaultValue = "all") String segment) {
        int count = pushService.countBySegment(segment);
        Set<Long> userIds = pushService.findUserIdsBySegment(segment);
        return ResponseEntity.ok(Map.of(
                "segment", segment,
                "count", count,
                "userIds", userIds.stream().sorted().collect(Collectors.toList())
        ));
    }
}
