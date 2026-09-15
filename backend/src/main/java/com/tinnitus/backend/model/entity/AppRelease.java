package com.tinnitus.backend.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "app_releases")
public class AppRelease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true, nullable = false)
    private String version;

    @NotNull
    @Column(unique = true, nullable = false)
    private Integer buildCode;

    @Size(max = 500)
    private String changelog;

    @Size(max = 50)
    private String apkFilename;

    @Column(name = "file_size_mb")
    private Double fileSizeMb;

    @Column(name = "sha256_hash")
    private String sha256Hash;

    @Column(name = "force_update")
    private boolean forceUpdate = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @OneToMany(mappedBy = "appRelease", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DownloadLog> downloadLogs;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getVersion() { return version; }

    public void setVersion(String version) { this.version = version; }

    public Integer getBuildCode() { return buildCode; }

    public void setBuildCode(Integer buildCode) { this.buildCode = buildCode; }

    public String getChangelog() { return changelog; }

    public void setChangelog(String changelog) { this.changelog = changelog; }

    public String getApkFilename() { return apkFilename; }

    public void setApkFilename(String apkFilename) { this.apkFilename = apkFilename; }

    public Double getFileSizeMb() { return fileSizeMb; }

    public void setFileSizeMb(Double fileSizeMb) { this.fileSizeMb = fileSizeMb; }

    public String getSha256Hash() { return sha256Hash; }

    public void setSha256Hash(String sha256Hash) { this.sha256Hash = sha256Hash; }

    public boolean isForceUpdate() { return forceUpdate; }

    public void setForceUpdate(boolean forceUpdate) { this.forceUpdate = forceUpdate; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUploadedBy() { return uploadedBy; }

    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }
}