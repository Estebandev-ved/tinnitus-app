package com.tinnitus.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.Profiles;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Solo con el perfil {@code prod}:
 * <ul>
 *   <li>Traduce DATABASE_URL / PG* (Railway) a spring.datasource.* (JDBC).</li>
 *   <li>Falla el arranque con UN mensaje claro que lista todas las variables criticas ausentes o debiles.</li>
 * </ul>
 * Nunca imprime valores de variables, solo sus nombres.
 */
public class ProductionEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    static final int MIN_SECRET_LENGTH = 32;

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication application) {
        if (!env.acceptsProfiles(Profiles.of("prod"))) {
            return;
        }
        List<String> problems = new ArrayList<>();
        Map<String, Object> overrides = new HashMap<>();

        try {
            PostgresConnectionResolver.Result db = PostgresConnectionResolver.resolve(env::getProperty);
            if (db == null) {
                problems.add("Base de datos: define DATABASE_URL (o PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD)");
            } else {
                overrides.put("spring.datasource.url", db.jdbcUrl());
                if (db.username() != null) overrides.put("spring.datasource.username", db.username());
                if (db.password() != null) overrides.put("spring.datasource.password", db.password());
            }
        } catch (IllegalStateException e) {
            problems.add("Base de datos: " + e.getMessage());
        }

        checkSecret(env, "JWT_SECRET", problems);
        checkSecret(env, "CLINICAL_SYNC_TOKEN", problems);
        checkPresent(env, "ADMIN_PASSWORD", problems);
        checkPresent(env, "ADMIN_EMAIL", problems);

        if (!problems.isEmpty()) {
            throw new IllegalStateException("Configuracion de produccion incompleta (perfil prod):\n - "
                    + String.join("\n - ", problems));
        }
        env.getPropertySources().addFirst(new MapPropertySource("prodDatasourceOverrides", overrides));
    }

    private static void checkPresent(ConfigurableEnvironment env, String name, List<String> problems) {
        String v = env.getProperty(name);
        if (v == null || v.isBlank()) {
            problems.add(name + " es obligatoria y no esta definida");
        }
    }

    private static void checkSecret(ConfigurableEnvironment env, String name, List<String> problems) {
        String v = env.getProperty(name);
        if (v == null || v.isBlank()) {
            problems.add(name + " es obligatoria y no esta definida");
        } else if (v.length() < MIN_SECRET_LENGTH) {
            problems.add(name + " es demasiado corta (minimo " + MIN_SECRET_LENGTH + " caracteres)");
        }
    }

    @Override
    public int getOrder() {
        // Despues de que ConfigData cargue application-prod.properties y las variables de entorno.
        return Ordered.LOWEST_PRECEDENCE;
    }
}
