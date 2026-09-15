package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.Audiometry;
import com.tinnitus.backend.model.entity.Prediction;
import com.tinnitus.backend.model.entity.ProgressNote;
import com.tinnitus.backend.model.entity.Role;
import com.tinnitus.backend.model.entity.TelemetryLog;
import com.tinnitus.backend.model.entity.ThiResult;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.model.entity.UserDevice;
import com.tinnitus.backend.model.entity.VoiceDiary;
import com.tinnitus.backend.repository.AudiometryRepository;
import com.tinnitus.backend.repository.PredictionRepository;
import com.tinnitus.backend.repository.ProgressNoteRepository;
import com.tinnitus.backend.repository.RoleRepository;
import com.tinnitus.backend.repository.TelemetryLogRepository;
import com.tinnitus.backend.repository.ThiResultRepository;
import com.tinnitus.backend.repository.UserDeviceRepository;
import com.tinnitus.backend.repository.UserRepository;
import com.tinnitus.backend.repository.VoiceDiaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio clínico: recibe los datos de salud del ecosistema (app móvil / web)
 * y los asocia a un paciente en el backend. Si el paciente no existe todavía
 * en el backend, se crea a partir del identificador externo (Firebase uid) y
 * el correo. De esta forma la web administrativa puede mostrar toda la
 * información del paciente de forma unificada.
 */
@Service
public class ClinicalService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ThiResultRepository thiResultRepository;
    private final AudiometryRepository audiometryRepository;
    private final UserDeviceRepository userDeviceRepository;
    private final TelemetryLogRepository telemetryLogRepository;
    private final PredictionRepository predictionRepository;
    private final VoiceDiaryRepository voiceDiaryRepository;
    private final ProgressNoteRepository progressNoteRepository;

    public ClinicalService(UserRepository userRepository,
                           RoleRepository roleRepository,
                           ThiResultRepository thiResultRepository,
                           AudiometryRepository audiometryRepository,
                           UserDeviceRepository userDeviceRepository,
                           TelemetryLogRepository telemetryLogRepository,
                           PredictionRepository predictionRepository,
                           VoiceDiaryRepository voiceDiaryRepository,
                           ProgressNoteRepository progressNoteRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.thiResultRepository = thiResultRepository;
        this.audiometryRepository = audiometryRepository;
        this.userDeviceRepository = userDeviceRepository;
        this.telemetryLogRepository = telemetryLogRepository;
        this.predictionRepository = predictionRepository;
        this.voiceDiaryRepository = voiceDiaryRepository;
        this.progressNoteRepository = progressNoteRepository;
    }

    /**
     * Crea o recupera el paciente en el backend a partir de su correo o
     * identificador externo. El password se marca como no usable (sincronización).
     */
    @Transactional
    public User upsertPatient(String patientId, String email, String username) {
        if (email != null && !email.isBlank()) {
            Optional<User> existing = userRepository.findByEmail(email);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        User user = new User();
        user.setEmail(email);

        String baseUsername = (username != null && !username.isBlank())
                ? username
                : (patientId != null ? patientId : email);
        String uniqueUsername = baseUsername;
        if (userRepository.existsByUsername(uniqueUsername)) {
            uniqueUsername = baseUsername + "_" + (patientId != null ? patientId : System.nanoTime());
        }
        user.setUsername(uniqueUsername);
        user.setPassword(java.util.UUID.randomUUID().toString());
        user.setEnabled(true);

        Role role = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role r = new Role();
            r.setName("ROLE_USER");
            return roleRepository.save(r);
        });
        user.setRole(role);

        return userRepository.save(user);
    }

    @Transactional
    public ThiResult saveThiResult(String patientId, String email, String username,
                                   int total, String grade, Integer functional,
                                   Integer emotional, Integer catastrophic, String answers,
                                   LocalDateTime createdAt) {
        User user = upsertPatient(patientId, email, username);
        ThiResult result = new ThiResult();
        result.setUser(user);
        result.setTotal(total);
        result.setGrade(grade);
        result.setFunctional(functional);
        result.setEmotional(emotional);
        result.setCatastrophic(catastrophic);
        result.setAnswers(answers);
        result.setCreatedAt(createdAt != null ? createdAt : LocalDateTime.now());
        return thiResultRepository.save(result);
    }

    @Transactional
    public Audiometry saveAudiometry(String patientId, String email, String username,
                                     String type, Double frequency, Integer volume, String ear,
                                     LocalDateTime measuredAt) {
        User user = upsertPatient(patientId, email, username);
        Audiometry audiometry = new Audiometry();
        audiometry.setUser(user);
        audiometry.setType(type);
        audiometry.setFrequency(frequency);
        audiometry.setVolume(volume);
        audiometry.setEar(ear);
        audiometry.setMeasuredAt(measuredAt != null ? measuredAt : LocalDateTime.now());
        return audiometryRepository.save(audiometry);
    }

    @Transactional
    public UserDevice saveDevice(String patientId, String email, String username,
                                 String platform, String deviceId, String appVersion) {
        User user = upsertPatient(patientId, email, username);
        UserDevice device = new UserDevice();
        device.setUser(user);
        device.setPlatform(platform);
        device.setDeviceId(deviceId);
        device.setAppVersion(appVersion);
        device.setLastSeen(LocalDateTime.now());
        return userDeviceRepository.save(device);
    }

    @Transactional
    public TelemetryLog saveTelemetryEvent(String patientId, String email, String username,
                                           String eventType, String platform, String appVersion,
                                           String deviceInfo, String sessionId, String payload,
                                           LocalDateTime timestamp) {
        User user = upsertPatient(patientId, email, username);
        TelemetryLog log = new TelemetryLog();
        log.setUser(user);
        log.setEventType(eventType);
        log.setPlatform(platform);
        log.setAppVersion(appVersion);
        log.setDeviceInfo(deviceInfo);
        log.setSessionId(sessionId);
        log.setPayload(payload);
        log.setTimestamp(timestamp != null ? timestamp : LocalDateTime.now());
        return telemetryLogRepository.save(log);
    }

    @Transactional
    public Prediction savePrediction(String patientId, String email, String username,
                                     String firebaseId, Integer riskScore, String riskLevel,
                                     String predictedWindow, String topFactors,
                                     String preventionActions, LocalDateTime createdAt) {
        User user = upsertPatient(patientId, email, username);
        Prediction p = new Prediction();
        p.setUser(user);
        p.setFirebaseId(firebaseId);
        p.setRiskScore(riskScore);
        p.setRiskLevel(riskLevel);
        p.setPredictedWindow(predictedWindow);
        p.setTopFactors(topFactors);
        p.setPreventionActions(preventionActions);
        p.setCreatedAt(createdAt != null ? createdAt : LocalDateTime.now());
        return predictionRepository.save(p);
    }

    @Transactional
    public VoiceDiary saveVoiceDiary(String patientId, String email, String username,
                                     String transcript, String emotionalState, Integer stressScore,
                                     Boolean tinnitusWorseningRisk, String recommendedSound,
                                     String summary, String aiResponse, LocalDateTime createdAt) {
        User user = upsertPatient(patientId, email, username);
        VoiceDiary v = new VoiceDiary();
        v.setUser(user);
        v.setTranscript(transcript);
        v.setEmotionalState(emotionalState);
        v.setStressScore(stressScore);
        v.setTinnitusWorseningRisk(tinnitusWorseningRisk);
        v.setRecommendedSound(recommendedSound);
        v.setSummary(summary);
        v.setAiResponse(aiResponse);
        v.setCreatedAt(createdAt != null ? createdAt : LocalDateTime.now());
        return voiceDiaryRepository.save(v);
    }

    @Transactional
    public ProgressNote saveProgressNote(String patientId, String email, String username,
                                        String text, String mood, LocalDateTime date,
                                        String aiAnalysis, LocalDateTime createdAt) {
        User user = upsertPatient(patientId, email, username);
        ProgressNote n = new ProgressNote();
        n.setUser(user);
        n.setText(text);
        n.setMood(mood);
        n.setDate(date);
        n.setAiAnalysis(aiAnalysis);
        n.setCreatedAt(createdAt != null ? createdAt : LocalDateTime.now());
        return progressNoteRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<ThiResult> getThiResults(User user) {
        return thiResultRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<Audiometry> getAudiometries(User user) {
        return audiometryRepository.findByUserOrderByMeasuredAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<Prediction> getPredictions(User user) {
        return predictionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<VoiceDiary> getVoiceDiaries(User user) {
        return voiceDiaryRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<ProgressNote> getProgressNotes(User user) {
        return progressNoteRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
