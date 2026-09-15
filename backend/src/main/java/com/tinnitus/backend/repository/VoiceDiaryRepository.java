package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.model.entity.VoiceDiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoiceDiaryRepository extends JpaRepository<VoiceDiary, Long> {
    List<VoiceDiary> findByUserOrderByCreatedAtDesc(User user);
    long countByUser(User user);
}
