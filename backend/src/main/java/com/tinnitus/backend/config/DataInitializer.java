package com.tinnitus.backend.config;

import com.tinnitus.backend.model.entity.AppRelease;
import com.tinnitus.backend.model.entity.Role;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.AppReleaseRepository;
import com.tinnitus.backend.repository.RoleRepository;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Inicializa datos mínimos al arrancar el backend:
 * - Roles ROLE_ADMIN y ROLE_USER.
 * - Un usuario administrador por defecto para acceder al panel web.
 *
 * SECURITY: app.admin.password NO tiene valor por defecto — es obligatorio
 * definir ADMIN_PASSWORD (env var) antes de arrancar, en cualquier perfil.
 * Solo application-dev.properties trae un valor de conveniencia para desarrollo
 * local, marcado explícitamente como "no apto para producción".
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppReleaseRepository appReleaseRepository;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.email:grubiano23@gmail.com}")
    private String adminEmail;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           AppReleaseRepository appReleaseRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.appReleaseRepository = appReleaseRepository;
    }

    @Override
    public void run(String... args) {
        try {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_ADMIN");
                return roleRepository.save(r);
            });
            roleRepository.findByName("ROLE_USER").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_USER");
                return roleRepository.save(r);
            });

            if (!userRepository.existsByUsername(adminUsername)) {
                User admin = new User();
                admin.setUsername(adminUsername);
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setEnabled(true);
                admin.setRole(adminRole);
                userRepository.save(admin);
                log.info("ADMIN CREADO -> usuario: '{}'", adminUsername);
            } else {
                log.info("ADMIN YA EXISTE -> usuario: '{}'", adminUsername);
            }

            // Release inicial de la app móvil (datos reales para el panel admin)
            if (appReleaseRepository.findTopByOrderByCreatedAtDesc().isEmpty()) {
                AppRelease release = new AppRelease();
                release.setVersion("1.0");
                release.setBuildCode(1);
                release.setChangelog("Versión inicial de TinnitOff para Android (Capacitor).");
                release.setForceUpdate(false);
                release.setApkFilename("tinnitusoff-v1.0.apk");
                release.setFileSizeMb(0.0);
                release.setSha256Hash("");
                appReleaseRepository.save(release);
                log.info("RELEASE INICIAL CREADO -> version: '1.0'  buildCode: 1");
            }
        } catch (Exception e) {
            log.error("Error inicializando datos por defecto", e);
        }
    }
}
