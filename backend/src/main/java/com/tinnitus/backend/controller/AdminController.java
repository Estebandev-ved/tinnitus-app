package com.tinnitus.backend.controller;

import com.tinnitus.backend.model.entity.*;
import com.tinnitus.backend.dto.UserDTO;
import com.tinnitus.backend.dto.PaginatedResponse;
import com.tinnitus.backend.dto.ContentItemResponse;
import com.tinnitus.backend.dto.AppReleaseResponse;
import com.tinnitus.backend.dto.TelemetryLogResponse;
import com.tinnitus.backend.repository.*;
import com.tinnitus.backend.service.ClinicalService;
import com.tinnitus.backend.service.DownloadLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Panel de administración web. Expone estadísticas globales y la información
 * detallada de cada paciente (dispositivos, telemetría y datos clínicos).
 * Protegido por rol ADMIN (URL y método).
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Panel", description = "Endpoints del panel de administración")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserDeviceRepository userDeviceRepository;
    private final TelemetryLogRepository telemetryLogRepository;
    private final ThiResultRepository thiResultRepository;
    private final AudiometryRepository audiometryRepository;
    private final PredictionRepository predictionRepository;
    private final VoiceDiaryRepository voiceDiaryRepository;
    private final ProgressNoteRepository progressNoteRepository;
    private final DownloadLogService downloadLogService;
    private final AppReleaseRepository appReleaseRepository;
    private final DownloadLogRepository downloadLogRepository;
    private final ClinicalService clinicalService;

    public AdminController(UserRepository userRepository,
                           RoleRepository roleRepository,
                           UserDeviceRepository userDeviceRepository,
                           TelemetryLogRepository telemetryLogRepository,
                           ThiResultRepository thiResultRepository,
                           AudiometryRepository audiometryRepository,
                           PredictionRepository predictionRepository,
                           VoiceDiaryRepository voiceDiaryRepository,
                           ProgressNoteRepository progressNoteRepository,
                           DownloadLogService downloadLogService,
                           AppReleaseRepository appReleaseRepository,
                           DownloadLogRepository downloadLogRepository,
                           ClinicalService clinicalService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userDeviceRepository = userDeviceRepository;
        this.telemetryLogRepository = telemetryLogRepository;
        this.thiResultRepository = thiResultRepository;
        this.audiometryRepository = audiometryRepository;
        this.predictionRepository = predictionRepository;
        this.voiceDiaryRepository = voiceDiaryRepository;
        this.progressNoteRepository = progressNoteRepository;
        this.downloadLogService = downloadLogService;
        this.appReleaseRepository = appReleaseRepository;
        this.downloadLogRepository = downloadLogRepository;
        this.clinicalService = clinicalService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Estadísticas generales del sistema")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDevices", userDeviceRepository.count());
        stats.put("totalTelemetry", telemetryLogRepository.count());
        stats.put("totalDownloads", downloadLogService.getTotalDownloads());
        stats.put("totalThiResults", thiResultRepository.count());
        stats.put("totalAudiometries", audiometryRepository.count());
        stats.put("totalPredictions", predictionRepository.count());
        stats.put("totalVoiceDiaries", voiceDiaryRepository.count());
        stats.put("totalProgressNotes", progressNoteRepository.count());
        stats.put("totalReleases", appReleaseRepository.count());

        Map<String, Long> byRole = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole() != null ? u.getRole().getName() : "UNKNOWN",
                        Collectors.counting()));
        stats.put("usersByRole", byRole);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @Operation(summary = "Listar usuarios con paginación")
    public ResponseEntity<?> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        var userPage = userRepository.findAll(PageRequest.of(page, size));
        List<UserDTO> dtos = userPage.getContent().stream()
                .map(u -> UserDTO.from(u,
                        (int) thiResultRepository.countByUser(u),
                        (int) audiometryRepository.countByUser(u),
                        (int) predictionRepository.countByUser(u),
                        (int) voiceDiaryRepository.countByUser(u),
                        (int) progressNoteRepository.countByUser(u)))
                .toList();
        PaginatedResponse<UserDTO> resp = new PaginatedResponse<UserDTO>(
                dtos, userPage.getNumber(), userPage.getSize(),
                userPage.getTotalElements(), userPage.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> userDetail(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", user.getId());
        m.put("username", user.getUsername());
        m.put("email", user.getEmail());
        m.put("role", user.getRole() != null ? user.getRole().getName() : null);
        m.put("enabled", user.isEnabled());
        m.put("createdAt", user.getCreatedAt());
        m.put("devices", user.getDevices() != null ? user.getDevices() : Collections.emptyList());
        m.put("telemetry", user.getTelemetryLogs() != null ? user.getTelemetryLogs() : Collections.emptyList());
        m.put("thiResults", clinicalService.getThiResults(user));
        m.put("audiometries", clinicalService.getAudiometries(user));
        m.put("predictions", clinicalService.getPredictions(user));
        m.put("voiceDiary", clinicalService.getVoiceDiaries(user));
        m.put("progressNotes", clinicalService.getProgressNotes(user));
        return ResponseEntity.ok(m);
    }

    @GetMapping("/telemetry/by-platform")
    public ResponseEntity<Map<String, Long>> telemetryByPlatform() {
        Map<String, Long> map = telemetryLogRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        t -> t.getPlatform() != null ? t.getPlatform() : "unknown",
                        Collectors.counting()));
        return ResponseEntity.ok(map);
    }

    @GetMapping("/downloads/by-platform")
    public ResponseEntity<Map<String, Long>> downloadsByPlatform() {
        Map<String, Long> map = downloadLogRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        d -> d.getPlatform() != null ? d.getPlatform() : "unknown",
                        Collectors.counting()));
        return ResponseEntity.ok(map);
    }

    @GetMapping("/releases")
    public ResponseEntity<List<AppRelease>> listReleases() {
        return ResponseEntity.ok(appReleaseRepository.findAll());
    }

    @PostMapping("/users/{id}/promote")
    @Operation(summary = "Ascender un usuario a administrador")
    public ResponseEntity<?> promoteUser(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth != null ? auth.getName() : null;

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Admin actual no encontrado"));

        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes ascenderte a ti mismo"));
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("Rol ROLE_ADMIN no existe"));

        target.setRole(adminRole);
        userRepository.save(target);

        return ResponseEntity.ok(Map.of(
                "message", "Usuario '" + target.getUsername() + "' ascendido a administrador",
                "userId", target.getId(),
                "newRole", "ROLE_ADMIN"
        ));
    }

    @PostMapping("/users/{id}/demote")
    @Operation(summary = "Degradar un administrador a usuario normal")
    public ResponseEntity<?> demoteUser(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth != null ? auth.getName() : null;

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Admin actual no encontrado"));

        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes degradarte a ti mismo"));
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Rol ROLE_USER no existe"));

        target.setRole(userRole);
        userRepository.save(target);

        return ResponseEntity.ok(Map.of(
                "message", "Usuario '" + target.getUsername() + "' degradado a usuario normal",
                "userId", target.getId(),
                "newRole", "ROLE_USER"
        ));
    }

    @PostMapping("/users/{id}/toggle-enabled")
    @Operation(summary = "Habilitar/deshabilitar una cuenta de usuario")
    public ResponseEntity<?> toggleUserEnabled(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth != null ? auth.getName() : null;

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Admin actual no encontrado"));

        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes deshabilitarte a ti mismo"));
        }

        target.setEnabled(!target.isEnabled());
        userRepository.save(target);

        return ResponseEntity.ok(Map.of(
                "message", "Usuario '" + target.getUsername() + "' " + (target.isEnabled() ? "habilitado" : "deshabilitado"),
                "userId", target.getId(),
                "enabled", target.isEnabled()
        ));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Eliminar un usuario")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth != null ? auth.getName() : null;

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Admin actual no encontrado"));

        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminarte a ti mismo"));
        }

        String username = target.getUsername();
        userRepository.deleteById(id);

        return ResponseEntity.ok(Map.of(
                "message", "Usuario '" + username + "' eliminado",
                "userId", id
        ));
    }
}
