package com.tinnitus.backend.repository;

import com.tinnitus.backend.model.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad Role.
 * Permite buscar roles por nombre para la gestión de autorización.
 */
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);
}
