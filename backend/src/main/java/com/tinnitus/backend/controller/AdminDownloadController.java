package com.tinnitus.backend.controller;

import com.tinnitus.backend.model.entity.AppRelease;
import com.tinnitus.backend.model.entity.DownloadLog;
import com.tinnitus.backend.service.DownloadLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST de administración para estadísticas de descargas.
 * Acceso restringido a usuarios con rol ADMIN (configurado en SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/admin/downloads")
public class AdminDownloadController {

    @Autowired
    private DownloadLogService downloadLogService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDownloadSummary() {
        long total = downloadLogService.getTotalDownloads();
        return ResponseEntity.ok(Map.of(
                "totalDownloads", total
        ));
    }

    @GetMapping("/by-version/{version}")
    public ResponseEntity<Long> getDownloadsByVersion(@PathVariable String version) {
        Optional<AppRelease> release = downloadLogService.getReleaseByVersion(version);
        long count = release.map(r -> downloadLogService.getDownloadsByVersion(r)).orElse(0L);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/by-platform/{platform}")
    public ResponseEntity<Long> getDownloadsByPlatform(@PathVariable String platform) {
        long count = downloadLogService.getDownloadsByPlatform(platform);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<DownloadLog>> getRecentDownloads(@RequestParam int limit) {
        List<DownloadLog> logs = downloadLogService.getRecentDownloads(limit);
        return ResponseEntity.ok(logs);
    }
}