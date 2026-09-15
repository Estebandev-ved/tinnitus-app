package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.*;
import com.tinnitus.backend.repository.AudiometryRepository;
import com.tinnitus.backend.repository.PredictionRepository;
import com.tinnitus.backend.repository.TelemetryLogRepository;
import com.tinnitus.backend.repository.ThiResultRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private ThiResultRepository thiResultRepository;
    @Mock private TelemetryLogRepository telemetryLogRepository;
    @Mock private AudiometryRepository audiometryRepository;
    @Mock private PredictionRepository predictionRepository;

    @InjectMocks
    private AlertService alertService;

    @Test
    void clinicalAlerts_severeTinnitus_triggersForHighScore() {
        User user = new User();
        user.setUsername("testuser");

        ThiResult thi = new ThiResult();
        thi.setTotal(78);
        thi.setGrade("Severe");
        thi.setCreatedAt(LocalDateTime.now().minusDays(2));

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(thiResultRepository.findByUserOrderByCreatedAtAsc(user)).thenReturn(List.of(thi));
        when(telemetryLogRepository.findByUserOrderByTimestampDesc(user)).thenReturn(Collections.emptyList());
        when(audiometryRepository.findByUserOrderByMeasuredAtDesc(user)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> alerts = alertService.clinicalAlerts();

        boolean hasSevere = alerts.stream()
            .anyMatch(a -> "SEVERE_TINNITUS".equals(a.get("type")));
        assertTrue(hasSevere, "Should trigger SEVERE_TINNITUS for total >= 60");
    }

    @Test
    void clinicalAlerts_noAlert_whenHealthy() {
        User user = new User();
        user.setUsername("healthy");

        ThiResult thi = new ThiResult();
        thi.setTotal(12);
        thi.setGrade("Mild");
        thi.setCreatedAt(LocalDateTime.now().minusDays(2));

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(thiResultRepository.findByUserOrderByCreatedAtAsc(user)).thenReturn(List.of(thi));
        when(telemetryLogRepository.findByUserOrderByTimestampDesc(user)).thenReturn(Collections.emptyList());
        when(audiometryRepository.findByUserOrderByMeasuredAtDesc(user)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> alerts = alertService.clinicalAlerts();

        assertTrue(alerts.isEmpty(), "Should not generate alerts for healthy user");
    }

    @Test
    void clinicalAlerts_abandoned_triggersForOldActivity() {
        User user = new User();
        user.setUsername("abandoned");

        ThiResult thi = new ThiResult();
        thi.setTotal(30);
        thi.setGrade("Mild");
        thi.setCreatedAt(LocalDateTime.now().minusDays(45));

        TelemetryLog tel = new TelemetryLog();
        tel.setTimestamp(LocalDateTime.now().minusDays(45));

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(thiResultRepository.findByUserOrderByCreatedAtAsc(user)).thenReturn(List.of(thi));
        when(telemetryLogRepository.findByUserOrderByTimestampDesc(user)).thenReturn(List.of(tel));
        when(audiometryRepository.findByUserOrderByMeasuredAtDesc(user)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> alerts = alertService.clinicalAlerts();

        boolean hasAbandoned = alerts.stream()
            .anyMatch(a -> "ABANDONED".equals(a.get("type")));
        assertTrue(hasAbandoned, "Should trigger ABANDONED for old activity");
    }
}
