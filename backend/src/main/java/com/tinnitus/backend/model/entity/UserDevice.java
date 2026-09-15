package com.tinnitus.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_devices")
public class UserDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "platform", nullable = false)
    private String platform;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "app_version")
    private String appVersion;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public String getPlatform() { return platform; }

    public void setPlatform(String platform) { this.platform = platform; }

    public String getDeviceId() { return deviceId; }

    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getAppVersion() { return appVersion; }

    public void setAppVersion(String appVersion) { this.appVersion = appVersion; }

    public LocalDateTime getLastSeen() { return lastSeen; }

    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
}