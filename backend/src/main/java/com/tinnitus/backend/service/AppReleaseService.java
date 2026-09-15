package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.AppRelease;
import com.tinnitus.backend.model.entity.DownloadLog;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.AppReleaseRepository;
import com.tinnitus.backend.repository.DownloadLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Servicio que gestiona las versiones de la aplicación (releases).
 * Maneja subida, consulta, descarga y log de descargas de APKs.
 *
 * Seguridad: Se calcula SHA-256 del APK para verificación de integridad.
 */
@Service
public class AppReleaseService {

    @Autowired
    private AppReleaseRepository appReleaseRepository;

    @Autowired
    private DownloadLogRepository downloadLogRepository;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Expone el FileStorageService para uso en controladores que necesiten acceso directo.
     */
    public FileStorageService getFileStorageService() {
        return fileStorageService;
    }

    /**
     * Sube y registra una nueva versión de la app.
     * Verifica que la versión no exista previamente para evitar duplicados.
     */
    @Transactional
    public AppRelease uploadRelease(String version, Integer buildCode, String changelog,
                                    String forceUpdate, User uploadedBy, byte[] apkFile) {
        if (appReleaseRepository.existsByVersion(version)) {
            throw new RuntimeException("Version " + version + " already exists");
        }

        String sha256Hash = computeSha256(apkFile);
        double fileSizeMb = apkFile.length / (1024.0 * 1024.0);

        AppRelease release = new AppRelease();
        release.setVersion(version);
        release.setBuildCode(buildCode);
        release.setChangelog(changelog);
        release.setForceUpdate("true".equals(forceUpdate) || "1".equals(forceUpdate));
        release.setFileSizeMb(fileSizeMb);
        release.setSha256Hash(sha256Hash);
        release.setUploadedBy(uploadedBy);
        release.setCreatedAt(LocalDateTime.now());

        return appReleaseRepository.save(release);
    }

    public Optional<AppRelease> getLatestRelease() {
        return appReleaseRepository.findTopByOrderByCreatedAtDesc();
    }

    public Optional<AppRelease> getReleaseByVersion(String version) {
        return appReleaseRepository.findByVersion(version);
    }

    public String getApkDownloadUrl(String version) {
        return "/api/v1/app/releases/download/" + version + ".apk";
    }

    /**
     * Registra una descarga de APK en el log.
     * El IP se almacena hasheado para preservar la privacidad del usuario.
     */
    @Transactional
    public DownloadLog logDownload(AppRelease appRelease, User user, String ipHash,
                                   String userAgent, String referer, String platform) {
        DownloadLog log = new DownloadLog();
        log.setAppRelease(appRelease);
        log.setUser(user);
        log.setIpHash(ipHash);
        log.setUserAgent(userAgent);
        log.setReferer(referer);
        log.setPlatform(platform);
        return downloadLogRepository.save(log);
    }

    @Transactional
    public AppRelease getOrCreateRelease(String version, Integer buildCode, String changelog,
                                         String forceUpdate, User uploadedBy, byte[] apkFile) {
        return appReleaseRepository.findByVersion(version)
                .map(existing -> {
                    existing.setChangelog(changelog);
                    existing.setForceUpdate("true".equals(forceUpdate) || "1".equals(forceUpdate));
                    return appReleaseRepository.save(existing);
                })
                .orElseGet(() -> uploadRelease(version, buildCode, changelog, forceUpdate, uploadedBy, apkFile));
    }

    private String computeSha256(byte[] data) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing SHA-256 hash", e);
        }
    }
}