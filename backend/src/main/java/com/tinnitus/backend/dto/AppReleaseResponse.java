package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.AppRelease;
import java.time.LocalDateTime;

public record AppReleaseResponse(
    Long id,
    String version,
    Integer buildCode,
    String changelog,
    boolean forceUpdate,
    String apkFilename,
    Double fileSizeMb,
    String sha256Hash,
    LocalDateTime createdAt
) {
    public static AppReleaseResponse from(AppRelease r) {
        return new AppReleaseResponse(
            r.getId(), r.getVersion(), r.getBuildCode(),
            r.getChangelog(), r.isForceUpdate(),
            r.getApkFilename(), r.getFileSizeMb(),
            r.getSha256Hash(), r.getCreatedAt()
        );
    }
}
