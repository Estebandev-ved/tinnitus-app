package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.ProgressNote;
import com.tinnitus.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressNoteRepository extends JpaRepository<ProgressNote, Long> {
    List<ProgressNote> findByUserOrderByCreatedAtDesc(User user);
    long countByUser(User user);
}
