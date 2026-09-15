package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad JwtToken.
 * Gestiona tokens JWT persistidos para control de sesión.
 */
public interface JwtTokenRepository extends JpaRepository<JwtToken, Long> {

    Optional<JwtToken> findByToken(String token);

    boolean existsByToken(String token);

    @Transactional
    void deleteByToken(String token);
}
