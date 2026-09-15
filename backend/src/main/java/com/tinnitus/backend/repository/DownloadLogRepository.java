package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.AppRelease;
import com.tinnitus.backend.model.entity.DownloadLog;
import com.tinnitus.backend.model.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface DownloadLogRepository extends JpaRepository<DownloadLog, Long> {

    List<DownloadLog> findByAppRelease(AppRelease appRelease);

    List<DownloadLog> findByUser(User user);

    List<DownloadLog> findByPlatform(String platform);

    List<DownloadLog> findByAppReleaseId(Long appReleaseId);

    /** Contar descargas por release */
    long countByAppRelease(AppRelease appRelease);

    /** Contar descargas por plataforma */
    long countByPlatform(String platform);

    /** Descargas recientes usando Pageable para limitar resultados */
    List<DownloadLog> findAllByOrderByDownloadedAtDesc(Pageable pageable);

    @Query("SELECT d FROM DownloadLog d WHERE d.downloadedAt >= ?1 AND d.downloadedAt <= ?2")
    List<DownloadLog> findByDateRange(LocalDateTime start, LocalDateTime end);
}