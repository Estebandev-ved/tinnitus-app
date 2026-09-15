package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.Audiometry;
import com.tinnitus.backend.model.entity.TelemetryLog;
import com.tinnitus.backend.model.entity.ThiResult;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.AudiometryRepository;
import com.tinnitus.backend.repository.TelemetryLogRepository;
import com.tinnitus.backend.repository.ThiResultRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Agregaciones clínicas y de uso para el panel de analítica del administrador.
 */
@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final TelemetryLogRepository telemetryLogRepository;
    private final ThiResultRepository thiResultRepository;
    private final AudiometryRepository audiometryRepository;

    public AnalyticsService(UserRepository userRepository,
                            TelemetryLogRepository telemetryLogRepository,
                            ThiResultRepository thiResultRepository,
                            AudiometryRepository audiometryRepository) {
        this.userRepository = userRepository;
        this.telemetryLogRepository = telemetryLogRepository;
        this.thiResultRepository = thiResultRepository;
        this.audiometryRepository = audiometryRepository;
    }

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /** Serie diaria de altas de usuario en los últimos `days` días. */
    public List<Map<String, Object>> signupsSeries(int days) {
        LocalDateTime since = LocalDate.now().minusDays(days).atStartOfDay();
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().isBefore(since))
                .collect(Collectors.toList());
        return dailySeries(users.stream().map(User::getCreatedAt).collect(Collectors.toList()), days);
    }

    /** Serie diaria de eventos de telemetría (actividad) en los últimos `days` días. */
    public List<Map<String, Object>> activitySeries(int days) {
        LocalDateTime since = LocalDate.now().minusDays(days).atStartOfDay();
        List<LocalDateTime> ts = telemetryLogRepository.findAll().stream()
                .filter(t -> t.getTimestamp() != null && !t.getTimestamp().isBefore(since))
                .map(TelemetryLog::getTimestamp)
                .collect(Collectors.toList());
        return dailySeries(ts, days);
    }

    /** Evolución del THI (promedio diario) + distribución por grado + mejora media. */
    public Map<String, Object> thiTrends(int days) {
        LocalDateTime since = LocalDate.now().minusDays(days).atStartOfDay();
        List<ThiResult> results = thiResultRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().isBefore(since))
                .collect(Collectors.toList());

        List<Map<String, Object>> series = dailyAvg(results.stream()
                .collect(Collectors.groupingBy(r -> r.getCreatedAt().toLocalDate(), Collectors.averagingInt(r -> r.getTotal() != null ? r.getTotal() : 0))), days);

        Map<String, Long> grades = thiResultRepository.findAll().stream()
                .filter(r -> r.getGrade() != null)
                .collect(Collectors.groupingBy(ThiResult::getGrade, Collectors.counting()));

        double improvement = averageThiImprovement();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("series", series);
        out.put("grades", grades);
        out.put("avgImprovement", Math.round(improvement * 10.0) / 10.0);
        out.put("count", results.size());
        return out;
    }

    /** Promedio de mejora por usuario: (primer THI - último THI). Positivo = mejora. */
    public double averageThiImprovement() {
        Map<User, List<ThiResult>> byUser = thiResultRepository.findAll().stream()
                .filter(r -> r.getUser() != null && r.getTotal() != null)
                .collect(Collectors.groupingBy(ThiResult::getUser));
        double sum = 0;
        int n = 0;
        for (List<ThiResult> list : byUser.values()) {
            if (list.size() < 2) continue;
            list.sort(Comparator.comparing(ThiResult::getCreatedAt));
            int first = list.get(0).getTotal();
            int last = list.get(list.size() - 1).getTotal();
            sum += (first - last);
            n++;
        }
        return n == 0 ? 0 : sum / n;
    }

    /** Volumen promedio por frecuencia (perfil de audición agregado). */
    public List<Map<String, Object>> audiometryByFrequency() {
        Map<Long, List<Audiometry>> byFreq = audiometryRepository.findAll().stream()
                .filter(a -> a.getFrequency() != null && a.getVolume() != null)
                .collect(Collectors.groupingBy(a -> Long.valueOf(Math.round(a.getFrequency()))));
        return byFreq.entrySet().stream()
                .map(e -> {
                    double avg = e.getValue().stream().mapToInt(Audiometry::getVolume).average().orElse(0);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("frequency", e.getKey().intValue());
                    m.put("avgVolume", Math.round(avg));
                    m.put("count", e.getValue().size());
                    return m;
                })
                .sorted(Comparator.comparing(m -> ((Number) m.get("frequency")).doubleValue()))
                .collect(Collectors.toList());
    }

    /** Adherencia: usuarios con actividad reciente (7/30/90 días). */
    public Map<String, Object> adherence() {
        long total = userRepository.count();
        LocalDateTime now = LocalDateTime.now();
        Set<Long> a7 = new HashSet<>(), a30 = new HashSet<>(), a90 = new HashSet<>();
        for (TelemetryLog t : telemetryLogRepository.findAll()) {
            if (t.getTimestamp() == null || t.getUser() == null) continue;
            if (t.getTimestamp().isAfter(now.minusDays(7))) a7.add(t.getUser().getId());
            if (t.getTimestamp().isAfter(now.minusDays(30))) a30.add(t.getUser().getId());
            if (t.getTimestamp().isAfter(now.minusDays(90))) a90.add(t.getUser().getId());
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalUsers", total);
        out.put("active7d", a7.size());
        out.put("active30d", a30.size());
        out.put("active90d", a90.size());
        return out;
    }

    /** Engagement: DAU/WAU/MAU y desglose por tipo de evento (telemetría). */
    public Map<String, Object> engagement() {
        LocalDateTime now = LocalDateTime.now();
        Set<Long> dau = new HashSet<>(), wau = new HashSet<>(), mau = new HashSet<>();
        Map<String, Long> byType = new LinkedHashMap<>();
        for (TelemetryLog t : telemetryLogRepository.findAll()) {
            if (t.getTimestamp() == null || t.getUser() == null) continue;
            if (t.getEventType() != null) {
                byType.merge(t.getEventType(), 1L, Long::sum);
            }
            if (t.getTimestamp().isAfter(now.minusDays(1))) dau.add(t.getUser().getId());
            if (t.getTimestamp().isAfter(now.minusDays(7))) wau.add(t.getUser().getId());
            if (t.getTimestamp().isAfter(now.minusDays(30))) mau.add(t.getUser().getId());
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("dau", dau.size());
        out.put("wau", wau.size());
        out.put("mau", mau.size());
        out.put("byEventType", byType);
        return out;
    }

    private List<Map<String, Object>> dailySeries(List<LocalDateTime> timestamps, int days) {
        Map<LocalDate, Long> counts = timestamps.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(LocalDateTime::toLocalDate, Collectors.counting()));
        return buildDaySeries(counts, days);
    }

    private List<Map<String, Object>> dailyAvg(Map<LocalDate, Double> avgByDay, int days) {
        Map<LocalDate, Long> asCount = new LinkedHashMap<>();
        avgByDay.forEach((k, v) -> asCount.put(k, Math.round(v)));
        return buildDaySeries(asCount, days);
    }

    private List<Map<String, Object>> buildDaySeries(Map<LocalDate, Long> counts, int days) {
        List<Map<String, Object>> series = new ArrayList<>();
        LocalDate start = LocalDate.now().minusDays(days - 1);
        for (int i = 0; i < days; i++) {
            LocalDate d = start.plusDays(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", d.format(DAY));
            m.put("value", counts.getOrDefault(d, 0L));
            series.add(m);
        }
        return series;
    }
}
