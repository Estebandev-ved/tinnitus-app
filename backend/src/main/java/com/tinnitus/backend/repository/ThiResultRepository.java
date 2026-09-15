package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.ThiResult;
import com.tinnitus.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ThiResultRepository extends JpaRepository<ThiResult, Long> {
    List<ThiResult> findByUserOrderByCreatedAtDesc(User user);
    List<ThiResult> findByUserOrderByCreatedAtAsc(User user);
    long countByUser(User user);
}
