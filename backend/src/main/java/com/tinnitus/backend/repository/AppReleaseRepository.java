package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.AppRelease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface AppReleaseRepository extends JpaRepository<AppRelease, Long> {

    Optional<AppRelease> findByVersion(String version);

    Optional<AppRelease> findTopByOrderByCreatedAtDesc();

    @Query("SELECT a FROM AppRelease a WHERE a.forceUpdate = true ORDER BY createdAt DESC")
    java.util.List<AppRelease> findForceUpdates();

    boolean existsByVersion(String version);
}