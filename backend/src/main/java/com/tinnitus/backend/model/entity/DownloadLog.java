package com.tinnitus.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "download_logs")
public class DownloadLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "app_release", nullable = false)
    private AppRelease appRelease;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "ip_hash")
    private String ipHash;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "referer")
    private String referer;

    @Column(name = "platform")
    private String platform;

    @Column(name = "downloaded_at")
    private LocalDateTime downloadedAt;

    @PrePersist
    protected void onCreate() {
        downloadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public AppRelease getAppRelease() { return appRelease; }

    public void setAppRelease(AppRelease appRelease) { this.appRelease = appRelease; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public String getIpHash() { return ipHash; }

    public void setIpHash(String ipHash) { this.ipHash = ipHash; }

    public String getUserAgent() { return userAgent; }

    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getReferer() { return referer; }

    public void setReferer(String referer) { this.referer = referer; }

    public String getPlatform() { return platform; }

    public void setPlatform(String platform) { this.platform = platform; }

    public LocalDateTime getDownloadedAt() { return downloadedAt; }

    public void setDownloadedAt(LocalDateTime downloadedAt) { this.downloadedAt = downloadedAt; }
}