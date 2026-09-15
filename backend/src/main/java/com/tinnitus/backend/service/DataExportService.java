package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.Audiometry;
import com.tinnitus.backend.model.entity.ThiResult;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.AudiometryRepository;
import com.tinnitus.backend.repository.ThiResultRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Exporta datos clínicos anonimizados (seudónimo P00001) para investigación.
 * No incluye PII (nombre, email) ni identificadores directos.
 */
@Service
public class DataExportService {

    private final UserRepository userRepository;
    private final ThiResultRepository thiResultRepository;
    private final AudiometryRepository audiometryRepository;

    public DataExportService(UserRepository userRepository,
                             ThiResultRepository thiResultRepository,
                             AudiometryRepository audiometryRepository) {
        this.userRepository = userRepository;
        this.thiResultRepository = thiResultRepository;
        this.audiometryRepository = audiometryRepository;
    }

    private boolean isAdmin(User u) {
        return u.getRole() != null && "ROLE_ADMIN".equals(u.getRole().getName());
    }

    private String rid(Long id) {
        return "P" + String.format("%05d", id);
    }

    public List<Map<String, Object>> thiRows() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (isAdmin(u)) continue;
            String researchId = rid(u.getId());
            for (ThiResult t : thiResultRepository.findByUserOrderByCreatedAtAsc(u)) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("research_id", researchId);
                m.put("thi_date", t.getCreatedAt());
                m.put("total", t.getTotal());
                m.put("grade", t.getGrade());
                m.put("functional", t.getFunctional());
                m.put("emotional", t.getEmotional());
                m.put("catastrophic", t.getCatastrophic());
                rows.add(m);
            }
        }
        return rows;
    }

    public List<Map<String, Object>> audiometryRows() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            if (isAdmin(u)) continue;
            String researchId = rid(u.getId());
            for (Audiometry a : audiometryRepository.findByUserOrderByMeasuredAtDesc(u)) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("research_id", researchId);
                m.put("measured_at", a.getMeasuredAt());
                m.put("type", a.getType());
                m.put("frequency_hz", a.getFrequency());
                m.put("volume_db", a.getVolume());
                m.put("ear", a.getEar());
                rows.add(m);
            }
        }
        return rows;
    }

    public static String toCsv(List<Map<String, Object>> rows) {
        if (rows.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", rows.get(0).keySet())).append('\n');
        for (Map<String, Object> r : rows) {
            boolean first = true;
            for (Object v : r.values()) {
                if (!first) sb.append(',');
                String val = v == null ? "" : v.toString();
                if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
                    val = "\"" + val.replace("\"", "\"\"") + "\"";
                }
                sb.append(val);
                first = false;
            }
            sb.append('\n');
        }
        return sb.toString();
    }
}
