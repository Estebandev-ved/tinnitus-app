package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.Prediction;
import com.tinnitus.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUserOrderByCreatedAtDesc(User user);
    long countByUser(User user);
}
