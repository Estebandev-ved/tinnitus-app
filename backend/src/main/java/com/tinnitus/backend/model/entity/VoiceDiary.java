package com.tinnitus.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voice_diaries")
public class VoiceDiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "transcript", columnDefinition = "TEXT")
    private String transcript;

    @Column(name = "emotional_state")
    private String emotionalState;

    @Column(name = "stress_score")
    private Integer stressScore;

    @Column(name = "tinnitus_worsening_risk")
    private Boolean tinnitusWorseningRisk;

    @Column(name = "recommended_sound")
    private String recommendedSound;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "ai_response", columnDefinition = "TEXT")
    private String aiResponse;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTranscript() { return transcript; }
    public void setTranscript(String transcript) { this.transcript = transcript; }
    public String getEmotionalState() { return emotionalState; }
    public void setEmotionalState(String emotionalState) { this.emotionalState = emotionalState; }
    public Integer getStressScore() { return stressScore; }
    public void setStressScore(Integer stressScore) { this.stressScore = stressScore; }
    public Boolean getTinnitusWorseningRisk() { return tinnitusWorseningRisk; }
    public void setTinnitusWorseningRisk(Boolean tinnitusWorseningRisk) { this.tinnitusWorseningRisk = tinnitusWorseningRisk; }
    public String getRecommendedSound() { return recommendedSound; }
    public void setRecommendedSound(String recommendedSound) { this.recommendedSound = recommendedSound; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
