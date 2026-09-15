package com.tinnitus.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.tinnitus.backend.config.FirebaseConfig;
import com.tinnitus.backend.model.entity.Prediction;
import com.tinnitus.backend.model.entity.TelemetryLog;
import com.tinnitus.backend.model.entity.ThiResult;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.PredictionRepository;
import com.tinnitus.backend.repository.TelemetryLogRepository;
import com.tinnitus.backend.repository.ThiResultRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PushService {

    private final FirebaseConfig firebaseConfig;
    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final ThiResultRepository thiResultRepository;
    private final TelemetryLogRepository telemetryLogRepository;

    public PushService(FirebaseConfig firebaseConfig,
                       UserRepository userRepository,
                       PredictionRepository predictionRepository,
                       ThiResultRepository thiResultRepository,
                       TelemetryLogRepository telemetryLogRepository) {
        this.firebaseConfig = firebaseConfig;
        this.userRepository = userRepository;
        this.predictionRepository = predictionRepository;
        this.thiResultRepository = thiResultRepository;
        this.telemetryLogRepository = telemetryLogRepository;
    }

    /** Cuenta usuarios que matchean un segmento clínico. */
    public int countBySegment(String segment) {
        return findUserIdsBySegment(segment).size();
    }

    /** Lista IDs de usuarios que matchean el segmento. */
    public Set<Long> findUserIdsBySegment(String segment) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == null || !"ROLE_ADMIN".equals(u.getRole().getName()))
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();

        return switch (segment == null ? "all" : segment) {
            case "high_risk" -> users.stream()
                    .filter(u -> {
                        List<Prediction> preds = predictionRepository.findByUserOrderByCreatedAtDesc(u);
                        return !preds.isEmpty()
                                && "high".equalsIgnoreCase(preds.get(0).getRiskLevel())
                                && preds.get(0).getCreatedAt() != null
                                && java.time.Duration.between(preds.get(0).getCreatedAt(), now).toDays() <= 30;
                    })
                    .map(User::getId)
                    .collect(Collectors.toSet());
            case "severe_thi" -> users.stream()
                    .filter(u -> {
                        List<ThiResult> thi = thiResultRepository.findByUserOrderByCreatedAtAsc(u);
                        if (thi.isEmpty()) return false;
                        ThiResult last = thi.get(thi.size() - 1);
                        return last.getGrade() != null && last.getGrade().equalsIgnoreCase("Severo")
                                && last.getCreatedAt() != null
                                && java.time.Duration.between(last.getCreatedAt(), now).toDays() <= 90;
                    })
                    .map(User::getId)
                    .collect(Collectors.toSet());
            case "no_activity" -> users.stream()
                    .filter(u -> {
                        List<TelemetryLog> tel = telemetryLogRepository.findByUserOrderByTimestampDesc(u);
                        if (tel.isEmpty()) {
                            return u.getCreatedAt() != null
                                    && java.time.Duration.between(u.getCreatedAt(), now).toDays() >= 14;
                        }
                        return java.time.Duration.between(tel.get(0).getTimestamp(), now).toDays() >= 30;
                    })
                    .map(User::getId)
                    .collect(Collectors.toSet());
            default -> users.stream().map(User::getId).collect(Collectors.toSet());
        };
    }

    /**
     * Envía notificación a un topic basado en el segmento.
     * Topic: "segment:<nombre>" (ej. "segment:high_risk").
     * El móvil debe suscribirse al topic que le corresponda.
     */
    public Map<String, Object> sendToSegment(String segment, String title, String body) {
        if (!firebaseConfig.isInitialized()) {
            return Map.of("ok", false, "message", "Firebase no configurado (define FIREBASE_SA).");
        }
        String topic = "segment:" + (segment == null || segment.isBlank() ? "all" : segment);
        int count = countBySegment(segment);
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();
            String response = FirebaseMessaging.getInstance().send(message);
            return Map.of("ok", true, "messageId", response, "segment", topic, "recipientCount", count);
        } catch (Exception e) {
            return Map.of("ok", false, "message", e.getMessage(), "segment", topic, "recipientCount", count);
        }
    }
}
