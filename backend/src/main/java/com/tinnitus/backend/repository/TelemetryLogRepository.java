package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.TelemetryLog;
import com.tinnitus.backend.model.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface TelemetryLogRepository extends JpaRepository<TelemetryLog, Long> {

    List<TelemetryLog> findByUser(User user);
    List<TelemetryLog> findByUserOrderByTimestampDesc(User user);

    List<TelemetryLog> findByPlatform(String platform);

    /** Eventos recientes usando Pageable */
    List<TelemetryLog> findAllByOrderByTimestampDesc(Pageable pageable);

    /** Contar eventos por tipo */
    long countByEventType(String eventType);

    @Query("SELECT t FROM TelemetryLog t WHERE t.timestamp >= ?1 AND t.timestamp <= ?2")
    List<TelemetryLog> findByDateRange(LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM TelemetryLog t WHERE t.eventType = ?1")
    List<TelemetryLog> findByEventType(String eventType);
}