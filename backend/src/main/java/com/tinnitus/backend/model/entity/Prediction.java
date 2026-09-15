package com.tinnitus.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "firebase_id")
    private String firebaseId;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "predicted_window")
    private String predictedWindow;

    @Column(name = "top_factors", columnDefinition = "TEXT")
    private String topFactors;

    @Column(name = "prevention_actions", columnDefinition = "TEXT")
    private String preventionActions;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFirebaseId() { return firebaseId; }
    public void setFirebaseId(String firebaseId) { this.firebaseId = firebaseId; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getPredictedWindow() { return predictedWindow; }
    public void setPredictedWindow(String predictedWindow) { this.predictedWindow = predictedWindow; }
    public String getTopFactors() { return topFactors; }
    public void setTopFactors(String topFactors) { this.topFactors = topFactors; }
    public String getPreventionActions() { return preventionActions; }
    public void setPreventionActions(String preventionActions) { this.preventionActions = preventionActions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
