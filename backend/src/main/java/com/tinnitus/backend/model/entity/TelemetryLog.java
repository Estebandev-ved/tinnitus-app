package com.tinnitus.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_logs")
public class TelemetryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "platform", nullable = false)
    private String platform;

    @Column(name = "app_version")
    private String appVersion;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public String getEventType() { return eventType; }

    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSessionId() { return sessionId; }

    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getPlatform() { return platform; }

    public void setPlatform(String platform) { this.platform = platform; }

    public String getAppVersion() { return appVersion; }

    public void setAppVersion(String appVersion) { this.appVersion = appVersion; }

    public String getDeviceInfo() { return deviceInfo; }

    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getPayload() { return payload; }

    public void setPayload(String payload) { this.payload = payload; }

    public LocalDateTime getTimestamp() { return timestamp; }

    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}