package com.tinnitus.backend.controller;

import com.tinnitus.backend.dto.*;
import com.tinnitus.backend.model.entity.*;
import com.tinnitus.backend.service.ClinicalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Endpoints de sincronización clínica. La app móvil envía datos vía form-data
 * (@RequestParam) y el panel web envía JSON (@RequestBody con DTOs).
 * Ambos formatos son soportados.
 */
@RestController
@RequestMapping("/api/v1/clinical")
@Tag(name = "Clinical Sync", description = "Sincronización de datos clínicos desde app móvil y web")
public class ClinicalController {

    private final ClinicalService clinicalService;

    public ClinicalController(ClinicalService clinicalService) {
        this.clinicalService = clinicalService;
    }

    private LocalDateTime parseTs(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            String iso = s.trim();
            if (iso.endsWith("Z")) {
                return OffsetDateTime.parse(iso, DateTimeFormatter.ISO_OFFSET_DATE_TIME).toLocalDateTime();
            }
            return LocalDateTime.parse(iso, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDateTime.parse(s.trim());
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    // ========== THI ==========

    @PostMapping("/thi")
    @Operation(summary = "Guardar resultado THI", description = "Recibe form-data (móvil) o JSON (web)")
    @ApiResponse(responseCode = "200", description = "THI guardado exitosamente")
    public ResponseEntity<?> saveThi(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Integer total,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) Integer functional,
            @RequestParam(required = false) Integer emotional,
            @RequestParam(required = false) Integer catastrophic,
            @RequestParam(required = false) String answers,
            @RequestParam(required = false) String createdAt) {

        if (total == null || grade == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "total and grade are required"));
        }
        ThiResult result = clinicalService.saveThiResult(
                patientId, email, username, total, grade, functional, emotional, catastrophic, answers, parseTs(createdAt));
        return ResponseEntity.ok(ThiResultDTO.from(result));
    }

    @PostMapping(value = "/thi", consumes = "application/json")
    @Operation(summary = "Guardar resultado THI (JSON body)")
    public ResponseEntity<?> saveThiJson(@Valid @RequestBody ThiRequest req) {
        ThiResult result = clinicalService.saveThiResult(
                req.patientId(), req.email(), req.username(),
                req.total(), req.grade(), req.functional(),
                req.emotional(), req.catastrophic(), req.answers(), parseTs(req.createdAt()));
        return ResponseEntity.ok(ThiResultDTO.from(result));
    }

    // ========== AUDIOMETRY ==========

    @PostMapping("/audiometry")
    @Operation(summary = "Guardar audiometría")
    public ResponseEntity<?> saveAudiometry(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double frequency,
            @RequestParam(required = false) Integer volume,
            @RequestParam(required = false) String ear,
            @RequestParam(required = false) String measuredAt) {

        Audiometry audiometry = clinicalService.saveAudiometry(
                patientId, email, username, type, frequency, volume, ear, parseTs(measuredAt));
        return ResponseEntity.ok(AudiometryResponse.from(audiometry));
    }

    @PostMapping(value = "/audiometry", consumes = "application/json")
    @Operation(summary = "Guardar audiometría (JSON body)")
    public ResponseEntity<?> saveAudiometryJson(@Valid @RequestBody AudiometryRequest req) {
        Audiometry audiometry = clinicalService.saveAudiometry(
                req.patientId(), req.email(), req.username(),
                req.type(), req.frequency(), req.volume(), req.ear(), parseTs(req.measuredAt()));
        return ResponseEntity.ok(AudiometryResponse.from(audiometry));
    }

    // ========== PATIENT ==========

    @PostMapping("/patient")
    @Operation(summary = "Crear/actualizar paciente")
    public ResponseEntity<?> upsertPatient(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username) {

        User user = clinicalService.upsertPatient(patientId, email, username);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    // ========== DEVICE ==========

    @PostMapping("/device")
    @Operation(summary = "Registrar dispositivo")
    public ResponseEntity<?> saveDevice(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String appVersion) {

        UserDevice device = clinicalService.saveDevice(patientId, email, username, platform, deviceId, appVersion);
        return ResponseEntity.ok(Map.of("id", device.getId(), "platform", device.getPlatform()));
    }

    @PostMapping(value = "/device", consumes = "application/json")
    @Operation(summary = "Registrar dispositivo (JSON body)")
    public ResponseEntity<?> saveDeviceJson(@Valid @RequestBody DeviceRequest req) {
        UserDevice device = clinicalService.saveDevice(
                req.patientId(), req.email(), req.username(),
                req.platform(), req.deviceId(), req.appVersion());
        return ResponseEntity.ok(Map.of("id", device.getId(), "platform", device.getPlatform()));
    }

    // ========== TELEMETRY ==========

    @PostMapping("/telemetry")
    @Operation(summary = "Registrar evento de telemetría")
    public ResponseEntity<?> saveTelemetry(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String appVersion,
            @RequestParam(required = false) String deviceInfo,
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String payload,
            @RequestParam(required = false) String timestamp) {

        TelemetryLog log = clinicalService.saveTelemetryEvent(
                patientId, email, username, eventType, platform, appVersion, deviceInfo, sessionId, payload, parseTs(timestamp));
        return ResponseEntity.ok(TelemetryLogResponse.from(log));
    }

    @PostMapping(value = "/telemetry", consumes = "application/json")
    @Operation(summary = "Registrar evento de telemetría (JSON body)")
    public ResponseEntity<?> saveTelemetryJson(@Valid @RequestBody TelemetryRequest req) {
        TelemetryLog log = clinicalService.saveTelemetryEvent(
                req.patientId(), req.email(), req.username(),
                req.eventType(), req.platform(), req.appVersion(),
                req.deviceInfo(), req.sessionId(), req.payload(), parseTs(req.timestamp()));
        return ResponseEntity.ok(TelemetryLogResponse.from(log));
    }

    // ========== PREDICTION ==========

    @PostMapping("/prediction")
    @Operation(summary = "Guardar predicción de riesgo")
    public ResponseEntity<?> savePrediction(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String firebaseId,
            @RequestParam(required = false) Integer riskScore,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String predictedWindow,
            @RequestParam(required = false) String topFactors,
            @RequestParam(required = false) String preventionActions,
            @RequestParam(required = false) String createdAt) {

        Prediction p = clinicalService.savePrediction(
                patientId, email, username, firebaseId, riskScore, riskLevel, predictedWindow,
                topFactors, preventionActions, parseTs(createdAt));
        return ResponseEntity.ok(PredictionDTO.from(p));
    }

    @PostMapping(value = "/prediction", consumes = "application/json")
    @Operation(summary = "Guardar predicción (JSON body)")
    public ResponseEntity<?> savePredictionJson(@Valid @RequestBody PredictionRequest req) {
        Prediction p = clinicalService.savePrediction(
                req.patientId(), req.email(), req.username(), req.firebaseId(),
                req.riskScore(), req.riskLevel(), req.predictedWindow(),
                req.topFactors(), req.preventionActions(), parseTs(req.createdAt()));
        return ResponseEntity.ok(PredictionDTO.from(p));
    }

    // ========== VOICE DIARY ==========

    @PostMapping("/voice-diary")
    @Operation(summary = "Guardar diario de voz")
    public ResponseEntity<?> saveVoiceDiary(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String transcript,
            @RequestParam(required = false) String emotionalState,
            @RequestParam(required = false) Integer stressScore,
            @RequestParam(required = false) Boolean tinnitusWorseningRisk,
            @RequestParam(required = false) String recommendedSound,
            @RequestParam(required = false) String summary,
            @RequestParam(required = false) String aiResponse,
            @RequestParam(required = false) String createdAt) {

        VoiceDiary vd = clinicalService.saveVoiceDiary(
                patientId, email, username, transcript, emotionalState, stressScore,
                tinnitusWorseningRisk, recommendedSound, summary, aiResponse, parseTs(createdAt));
        return ResponseEntity.ok(VoiceDiaryResponse.from(vd));
    }

    @PostMapping(value = "/voice-diary", consumes = "application/json")
    @Operation(summary = "Guardar diario de voz (JSON body)")
    public ResponseEntity<?> saveVoiceDiaryJson(@Valid @RequestBody VoiceDiaryRequest req) {
        VoiceDiary vd = clinicalService.saveVoiceDiary(
                req.patientId(), req.email(), req.username(), req.transcript(),
                req.emotionalState(), req.stressScore(), req.tinnitusWorseningRisk(),
                req.recommendedSound(), req.summary(), req.aiResponse(), parseTs(req.createdAt()));
        return ResponseEntity.ok(VoiceDiaryResponse.from(vd));
    }

    // ========== PROGRESS NOTE ==========

    @PostMapping("/progress-note")
    @Operation(summary = "Guardar nota de progreso")
    public ResponseEntity<?> saveProgressNote(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String text,
            @RequestParam(required = false) String mood,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String aiAnalysis,
            @RequestParam(required = false) String createdAt) {

        ProgressNote note = clinicalService.saveProgressNote(
                patientId, email, username, text, mood, parseTs(date), aiAnalysis, parseTs(createdAt));
        return ResponseEntity.ok(ProgressNoteResponse.from(note));
    }

    @PostMapping(value = "/progress-note", consumes = "application/json")
    @Operation(summary = "Guardar nota de progreso (JSON body)")
    public ResponseEntity<?> saveProgressNoteJson(@Valid @RequestBody ProgressNoteRequest req) {
        ProgressNote note = clinicalService.saveProgressNote(
                req.patientId(), req.email(), req.username(), req.text(),
                req.mood(), parseTs(req.date()), req.aiAnalysis(), parseTs(req.createdAt()));
        return ResponseEntity.ok(ProgressNoteResponse.from(note));
    }
}
