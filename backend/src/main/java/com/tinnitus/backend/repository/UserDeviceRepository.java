package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.model.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    List<UserDevice> findByUser(User user);

    List<UserDevice> findByPlatform(String platform);

    @Query("SELECT ud FROM UserDevice ud WHERE ud.platform = ?1 ORDER BY ud.lastSeen DESC")
    List<UserDevice> findByPlatformOrderByLastSeenDesc(String platform);

    @Query("SELECT ud FROM UserDevice ud WHERE ud.lastSeen >= ?1")
    List<UserDevice> findActiveSince(LocalDateTime since);
}