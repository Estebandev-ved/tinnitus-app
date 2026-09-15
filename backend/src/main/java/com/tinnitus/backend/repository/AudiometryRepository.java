package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.Audiometry;
import com.tinnitus.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AudiometryRepository extends JpaRepository<Audiometry, Long> {
    List<Audiometry> findByUserOrderByMeasuredAtDesc(User user);
    long countByUser(User user);
}
