package com.tinnitus.backend.controller;

import com.tinnitus.backend.model.entity.AppRelease;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.service.AppReleaseService;
import com.tinnitus.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Controlador REST alternativo para gestión de releases.
 * Incluye endpoints protegidos por rol ADMIN para subida y descarga autenticada.
 *
 * Seguridad: @PreAuthorize garantiza que solo ADMIN puede subir versiones.
 */
@RestController
@RequestMapping("/api/v1/releases")
public class ReleaseController {

    @Autowired
    private AppReleaseService appReleaseService;

    @Autowired
    private UserService userService;

    @GetMapping("/latest")
    public ResponseEntity<AppRelease> getLatestRelease() {
        Optional<AppRelease> latest = appReleaseService.getLatestRelease();
        return latest.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/latest/{version}")
    public ResponseEntity<AppRelease> getReleaseByVersion(@PathVariable String version) {
        Optional<AppRelease> release = appReleaseService.getReleaseByVersion(version);
        return release.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppRelease> uploadRelease(
            @RequestParam String version,
            @RequestParam Integer buildCode,
            @RequestParam(required = false) String changelog,
            @RequestParam(required = false) String forceUpdate,
            @RequestParam byte[] apkFile,
            @RequestParam String apkFilename) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User uploadedBy = null;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            uploadedBy = userService.getUserById(null);
        }

        AppRelease release = appReleaseService.uploadRelease(
                version, buildCode, changelog, forceUpdate, uploadedBy, apkFile);

        return new ResponseEntity<>(release, HttpStatus.CREATED);
    }

    @GetMapping("/download/{version}.apk")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<org.springframework.core.io.Resource> downloadApk(
            @PathVariable String version,
            @RequestParam(value = "ref", required = false) String referer) {

        Optional<AppRelease> releaseOpt = appReleaseService.getReleaseByVersion(version);
        if (releaseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        AppRelease release = releaseOpt.get();
        org.springframework.core.io.Resource resource = appReleaseService.getFileStorageService()
                .getApkResource(release.getApkFilename());

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + release.getApkFilename() + "\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}