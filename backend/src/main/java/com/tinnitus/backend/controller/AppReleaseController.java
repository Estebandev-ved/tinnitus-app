package com.tinnitus.backend.controller;

import com.tinnitus.backend.model.dto.UploadResponse;
import com.tinnitus.backend.model.entity.AppRelease;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.service.AppReleaseService;
import com.tinnitus.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

/**
 * Controlador REST para gestión de versiones de la app (releases/APKs).
 *
 * Seguridad:
 * - La descarga de APKs es pública para facilitar la distribución
 * - La subida de APKs requiere autenticación (controlada por SecurityConfig)
 * - El IP del cliente se almacena hasheado para privacidad en los logs
 */
@RestController
@RequestMapping("/api/v1/app/releases")
public class AppReleaseController {

    @Autowired
    private AppReleaseService appReleaseService;

    @Autowired
    private UserService userService;

    @GetMapping("/latest")
    public ResponseEntity<AppRelease> getLatestRelease() {
        return appReleaseService.getLatestRelease()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/latest/{version}")
    public ResponseEntity<AppRelease> getReleaseByVersion(@PathVariable String version) {
        return appReleaseService.getReleaseByVersion(version)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/download/{version}.apk")
    public ResponseEntity<byte[]> downloadApk(@PathVariable String version, HttpServletRequest request) {
        Optional<AppRelease> release = appReleaseService.getReleaseByVersion(version);
        if (release.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AppRelease appRelease = release.get();
        byte[] apkFile = appReleaseService.getFileStorageService().getApkFile(appRelease);

        // Registrar descarga con IP hasheada (privacidad del usuario)
        String ipHash = request.getHeader("X-Forwarded-For");
        if (ipHash == null) {
            ipHash = request.getRemoteAddr();
        }

        appReleaseService.logDownload(appRelease, null, ipHash,
                request.getHeader("User-Agent"), request.getHeader("Referer"),
                "android");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=\"" + appRelease.getApkFilename() + "\"")
                .body(apkFile);
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse uploadApk(@RequestParam("file") MultipartFile file,
                                     @RequestParam("version") String version,
                                     @RequestParam("buildCode") Integer buildCode,
                                     @RequestParam(value = "changelog", required = false) String changelog,
                                     @RequestParam(value = "forceUpdate", required = false, defaultValue = "false") String forceUpdate,
                                     @RequestHeader(value = "X-User-Id", required = false) Long userId,
                                     HttpServletRequest request) throws IOException {
        User uploadedBy = null;
        if (userId != null) {
            uploadedBy = userService.getUserById(userId);
        }

        AppRelease release = appReleaseService.uploadRelease(
                version, buildCode, changelog, forceUpdate, uploadedBy, file.getBytes()
        );

        String downloadUrl = request.getScheme() + "://" + request.getHeader("Host")
                + "/api/v1/app/releases/download/" + version + ".apk";

        return new UploadResponse(release.getId(), release.getVersion(), downloadUrl);
    }
}