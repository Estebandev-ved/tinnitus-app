package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.AppRelease;
import com.tinnitus.backend.model.entity.DownloadLog;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.AppReleaseRepository;
import com.tinnitus.backend.repository.DownloadLogRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestión de logs de descarga.
 *
 * Seguridad: El IP de los usuarios se almacena hasheado para preservar privacidad
 * y cumplir con principios de mínima exposición de datos.
 */
@Service
public class DownloadLogService {

    @Autowired
    private DownloadLogRepository downloadLogRepository;

    @Autowired
    private AppReleaseRepository appReleaseRepository;

    @Autowired
    private UserRepository userRepository;

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
    public DownloadLog logDownload(Long appReleaseId, String ipHash, String userAgent,
                                   String referer, String platform) {
        AppRelease appRelease = appReleaseRepository.findById(appReleaseId)
                .orElseThrow(() -> new RuntimeException("App release not found"));
        return logDownload(appRelease, null, ipHash, userAgent, referer, platform);
    }

    /**
     * Busca un release por versión para su uso en controladores de admin.
     */
    public Optional<AppRelease> getReleaseByVersion(String version) {
        return appReleaseRepository.findByVersion(version);
    }

    public long getTotalDownloads() {
        return downloadLogRepository.count();
    }

    public long getDownloadsByVersion(AppRelease appRelease) {
        return downloadLogRepository.countByAppRelease(appRelease);
    }

    public long getDownloadsByPlatform(String platform) {
        return downloadLogRepository.countByPlatform(platform);
    }

    /** Retorna los N downloads más recientes usando Pageable. */
    public List<DownloadLog> getRecentDownloads(int limit) {
        return downloadLogRepository.findAllByOrderByDownloadedAtDesc(
                PageRequest.of(0, limit, Sort.by("downloadedAt").descending())
        );
    }
}