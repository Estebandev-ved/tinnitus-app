package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.model.entity.Role;
import com.tinnitus.backend.repository.UserRepository;
import com.tinnitus.backend.repository.RoleRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;

/**
 * Servicio de usuarios que implementa UserDetailsService de Spring Security.
 * Gestiona registro, actualización de roles y carga de usuarios por username.
 *
 * Seguridad: Los roles se mapean como GrantedAuthority con prefijo ROLE_
 * para compatibilidad con hasRole() de Spring Security.
 */
@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Carga el usuario por username para Spring Security.
     * Lanza UsernameNotFoundException si no existe (estándar de Spring Security).
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_USER";
        // Asegurar que el rol tenga el prefijo ROLE_
        String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(authority)))
                .build();
    }

    /**
     * Carga el User (entidad JPA) por username para uso interno.
     * Distinto de loadUserByUsername que retorna UserDetails (Spring Security).
     */
    @Transactional(readOnly = true)
    public User loadUserEntityByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    /**
     * Obtiene un usuario por ID.
     * Retorna null si no existe (para compatibilidad con controladores que usan userId opcional).
     */
    @Transactional(readOnly = true)
    public User getUserById(@org.springframework.lang.Nullable Long id) {
        return userRepository.findById(id).orElse(null);
    }

    /**
     * Registra un nuevo usuario con el rol especificado.
     * Crea el rol si no existe. Contraseña debe llegar ya encriptada.
     */
    @Transactional
    public User registerUser(String username, String email, String password, String roleName) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(true);

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });
        user.setRole(role);
        return userRepository.save(user);
    }

    /**
     * Actualiza el rol de un usuario existente.
     * Crea el rol si no existe.
     */
    @Transactional
    public User updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });
        user.setRole(role);
        return userRepository.save(user);
    }
}