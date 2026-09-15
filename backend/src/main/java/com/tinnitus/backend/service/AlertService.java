package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.Audiometry;
import com.tinnitus.backend.model.entity.Prediction;
import com.tinnitus.backend.model.entity.TelemetryLog;
import com.tinnitus.backend.model.entity.ThiResult;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.AudiometryRepository;
import com.tinnitus.backend.repository.PredictionRepository;
import com.tinnitus.backend.repository.TelemetryLogRepository;
import com.tinnitus.backend.repository.ThiResultRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Detecta pacientes que requieren atención clínica: tinnitus severo,
 * empeoramiento, abandono de tratamiento o falta de engagement.
 */
@Service
public class AlertService {

    private final UserRepository userRepository;
    private final ThiResultRepository thiResultRepository;
    private final TelemetryLogRepository telemetryLogRepository;
    private final AudiometryRepository audiometryRepository;
    private final PredictionRepository predictionRepository;

    private static final int SEVERE_THRESHOLD = 78;
    private static final int DETERIORATION_THRESHOLD = 10;
    private static final int ABANDONED_DAYS = 30;
    private static final int NO_ENGAGEMENT_DAYS = 14;
    private static final int HEARING_LOSS_THRESHOLD = 80;

    public AlertService(UserRepository userRepository,
                        ThiResultRepository thiResultRepository,
                        TelemetryLogRepository telemetryLogRepository,
                        AudiometryRepository audiometryRepository,
                        PredictionRepository predictionRepository) {
        this.userRepository = userRepository;
        this.thiResultRepository = thiResultRepository;
        this.telemetryLogRepository = telemetryLogRepository;
        this.audiometryRepository = audiometryRepository;
        this.predictionRepository = predictionRepository;
    }

    public List<Map<String, Object>> clinicalAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (User user : userRepository.findAll()) {
            if (user.getRole() != null && "ROLE_ADMIN".equals(user.getRole().getName())) continue;

            List<ThiResult> thi = thiResultRepository.findByUserOrderByCreatedAtAsc(user);
            List<TelemetryLog> tel = telemetryLogRepository.findByUserOrderByTimestampDesc(user);
            List<Audiometry> aud = audiometryRepository.findByUserOrderByMeasuredAtDesc(user);

            // 1) Tinnitus severo (última evaluación)
            if (!thi.isEmpty()) {
                ThiResult last = thi.get(thi.size() - 1);
                boolean severe = last.getTotal() != null && last.getTotal() >= SEVERE_THRESHOLD;
                if (!severe && last.getGrade() != null) severe = last.getGrade().equalsIgnoreCase("Severo");
                if (severe) {
                    alerts.add(alert(user, "SEVERE_TINNITUS", "HIGH",
                            "Tinnitus severo (THI " + last.getTotal() + ")", last.getTotal(), last.getCreatedAt()));
                }
                // 2) Empeoramiento
                if (thi.size() >= 2) {
                    int first = thi.get(0).getTotal() != null ? thi.get(0).getTotal() : 0;
                    int latest = last.getTotal() != null ? last.getTotal() : 0;
                    int delta = latest - first;
                    if (delta >= DETERIORATION_THRESHOLD) {
                        alerts.add(alert(user, "DETERIORATION", "MEDIUM",
                                "Empeoramiento THI: " + first + " → " + latest + " (+" + delta + ")", delta, last.getCreatedAt()));
                    }
                }
            }

            // 3) Abandono (actividad previa pero inactivo recientemente)
            if (!tel.isEmpty()) {
                LocalDateTime lastTel = tel.get(0).getTimestamp();
                long daysIdle = java.time.Duration.between(lastTel, now).toDays();
                if (daysIdle >= ABANDONED_DAYS) {
                    alerts.add(alert(user, "ABANDONED", "MEDIUM",
                            "Sin actividad en " + daysIdle + " días", daysIdle, lastTel));
                }
            } else if (user.getCreatedAt() != null &&
                       java.time.Duration.between(user.getCreatedAt(), now).toDays() >= NO_ENGAGEMENT_DAYS) {
                // 4) Sin engagement (registrado pero nunca usó la app)
                alerts.add(alert(user, "NO_ENGAGEMENT", "LOW",
                        "Registrado pero sin actividad clínica", null, user.getCreatedAt()));
            }

            // 5) Hipoacusia (volumen auditivo alto en alguna frecuencia)
            if (!aud.isEmpty()) {
                Audiometry worst = aud.stream()
                        .filter(a -> a.getVolume() != null)
                        .max(Comparator.comparingInt(Audiometry::getVolume))
                        .orElse(null);
                if (worst != null && worst.getVolume() >= HEARING_LOSS_THRESHOLD) {
                    String sev = worst.getVolume() >= 90 ? "HIGH" : "MEDIUM";
                    String freq = worst.getFrequency() != null ? Math.round(worst.getFrequency()) + " Hz" : "N/A";
                    alerts.add(alert(user, "HEARING_LOSS", sev,
                            "Posible hipoacusia: " + worst.getVolume() + " dB a " + freq, worst.getVolume(), worst.getMeasuredAt()));
                }
            }

            // 6) Predicción de riesgo alto (última predicción del paciente)
            List<Prediction> preds = predictionRepository.findByUserOrderByCreatedAtDesc(user);
            if (!preds.isEmpty()) {
                Prediction latest = preds.get(0);
                if ("high".equalsIgnoreCase(latest.getRiskLevel()) && latest.getCreatedAt() != null
                        && java.time.Duration.between(latest.getCreatedAt(), now).toDays() <= 30) {
                    alerts.add(alert(user, "HIGH_RISK_PREDICTION", "HIGH",
                            "Predicción de riesgo alto: " + latest.getRiskScore() + "/100",
                            latest.getRiskScore(), latest.getCreatedAt()));
                }
            }
        }

        alerts.sort(Comparator.comparingInt(a -> severityRank((String) a.get("severity"))));
        return alerts;
    }

    private int severityRank(String s) {
        if ("HIGH".equals(s)) return 0;
        if ("MEDIUM".equals(s)) return 1;
        return 2;
    }

    private Map<String, Object> alert(User user, String type, String severity, String message, Object value, LocalDateTime date) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId", user.getId());
        m.put("username", user.getUsername());
        m.put("email", user.getEmail());
        m.put("type", type);
        m.put("severity", severity);
        m.put("message", message);
        m.put("value", value);
        m.put("date", date);
        return m;
    }
}
