package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.TelemetryLog;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.TelemetryLogRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de telemetría para registro de eventos y dispositivos.
 * Los eventos anónimos (user=null) están permitidos para no bloquear
 * el registro de dispositivos de usuarios no autenticados.
 */
@Service
public class TelemetryService {

    @Autowired
    private TelemetryLogRepository telemetryLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public TelemetryLog logDeviceRegistration(User user, String platform, String deviceId,
                                              String appVersion, String deviceInfo) {
        TelemetryLog log = new TelemetryLog();
        log.setUser(user);
        log.setEventType("device_registration");
        log.setPlatform(platform);
        log.setAppVersion(appVersion);
        log.setDeviceInfo(deviceInfo);
        log.setSessionId(deviceId);
        return telemetryLogRepository.save(log);
    }

    @Transactional
    public TelemetryLog logEvent(User user, String eventType, String platform, String appVersion,
                                  String deviceInfo, String sessionId) {
        TelemetryLog log = new TelemetryLog();
        log.setUser(user);
        log.setEventType(eventType);
        log.setPlatform(platform);
        log.setAppVersion(appVersion);
        log.setDeviceInfo(deviceInfo);
        log.setSessionId(sessionId);
        return telemetryLogRepository.save(log);
    }

    public long getEventCountByType(String eventType) {
        return telemetryLogRepository.countByEventType(eventType);
    }

    /** Retorna los N eventos más recientes usando Pageable. */
    public List<TelemetryLog> getRecentEvents(int limit) {
        return telemetryLogRepository.findAllByOrderByTimestampDesc(
                PageRequest.of(0, limit, Sort.by("timestamp").descending())
        );
    }

    public List<TelemetryLog> getEventsByPlatform(String platform) {
        return telemetryLogRepository.findByPlatform(platform);
    }
}