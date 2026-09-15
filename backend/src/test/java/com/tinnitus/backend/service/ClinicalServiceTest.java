package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.*;
import com.tinnitus.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClinicalServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private ThiResultRepository thiResultRepository;
    @Mock private AudiometryRepository audiometryRepository;
    @Mock private PredictionRepository predictionRepository;
    @Mock private VoiceDiaryRepository voiceDiaryRepository;
    @Mock private ProgressNoteRepository progressNoteRepository;
    @Mock private TelemetryLogRepository telemetryLogRepository;

    @InjectMocks
    private ClinicalService clinicalService;

    @Test
    void saveThiResult_shouldSave() {
        when(userRepository.existsByUsername("u1")).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(java.util.Optional.of(new Role()));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        ThiResult saved = new ThiResult();
        saved.setId(1L);
        when(thiResultRepository.save(any(ThiResult.class))).thenReturn(saved);

        ThiResult result = clinicalService.saveThiResult(
                "u1", null, null, 45, "Moderate", 15, 20, 10, null, null);

        assertNotNull(result);
        verify(thiResultRepository).save(any(ThiResult.class));
    }

    @Test
    void getThiResults_shouldReturnList() {
        User user = new User();
        user.setId(1L);
        ThiResult t = new ThiResult();
        t.setTotal(30);
        when(thiResultRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(t));

        List<ThiResult> results = clinicalService.getThiResults(user);

        assertEquals(1, results.size());
        assertEquals(30, results.get(0).getTotal());
    }

    @Test
    void getPredictions_shouldReturnList() {
        User user = new User();
        user.setId(1L);
        Prediction p = new Prediction();
        p.setRiskScore(75);
        when(predictionRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(p));

        List<Prediction> results = clinicalService.getPredictions(user);

        assertEquals(1, results.size());
        assertEquals(75, results.get(0).getRiskScore());
    }
}
