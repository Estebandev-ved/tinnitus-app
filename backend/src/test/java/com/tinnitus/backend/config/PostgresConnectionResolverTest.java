package com.tinnitus.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Tests puros: sin base de datos ni contexto Spring. Valores ficticios. */
class PostgresConnectionResolverTest {

    @Test
    void railwayStyleUrlIsConvertedToJdbc() {
        var r = PostgresConnectionResolver.resolve(Map.of("DATABASE_URL",
                "postgresql://pguser:p%40ss%2Bw@db.internal:5433/railway?sslmode=require")::get);
        assertEquals("jdbc:postgresql://db.internal:5433/railway?sslmode=require", r.jdbcUrl());
        assertEquals("pguser", r.username());
        assertEquals("p@ss+w", r.password());
        assertFalse(r.toString().contains("p@ss"));
    }

    @Test
    void postgresSchemeAndDefaultPort() {
        var r = PostgresConnectionResolver.resolve(Map.of("DATABASE_URL", "postgres://u:p@h/db")::get);
        assertEquals("jdbc:postgresql://h:5432/db", r.jdbcUrl());
    }

    @Test
    void jdbcUrlKeepsSeparateCredentials() {
        var r = PostgresConnectionResolver.resolve(Map.of("DATABASE_URL", "jdbc:postgresql://postgres:5432/tinnitusdb",
                "DATABASE_USERNAME", "app", "DATABASE_PASSWORD", "secret")::get);
        assertEquals("jdbc:postgresql://postgres:5432/tinnitusdb", r.jdbcUrl());
        assertEquals("app", r.username());
        assertEquals("secret", r.password());
    }

    @Test
    void pgVariablesFallback() {
        var r = PostgresConnectionResolver.resolve(Map.of("PGHOST", "h", "PGPORT", "6000", "PGDATABASE", "d",
                "PGUSER", "u", "PGPASSWORD", "p")::get);
        assertEquals("jdbc:postgresql://h:6000/d", r.jdbcUrl());
        assertEquals("u", r.username());
        assertEquals("p", r.password());
    }

    @Test
    void nothingConfiguredReturnsNullAndBadSchemeFails() {
        assertNull(PostgresConnectionResolver.resolve(k -> null));
        assertThrows(IllegalStateException.class,
                () -> PostgresConnectionResolver.resolve(Map.of("DATABASE_URL", "mysql://x/y")::get));
    }

    @Test
    void prodProfileFailsClearlyWhenCriticalVarsMissing() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("JWT_SECRET", "short");
        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> new ProductionEnvironmentPostProcessor().postProcessEnvironment(env, new SpringApplication()));
        String m = e.getMessage();
        assertTrue(m.contains("JWT_SECRET") && m.contains("CLINICAL_SYNC_TOKEN") && m.contains("ADMIN_PASSWORD")
                && m.contains("ADMIN_EMAIL") && m.contains("DATABASE_URL"));
        assertFalse(m.contains("short"));
    }

    @Test
    void prodProfileSetsDatasourceWhenComplete() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("JWT_SECRET", "a".repeat(40));
        env.setProperty("CLINICAL_SYNC_TOKEN", "b".repeat(40));
        env.setProperty("ADMIN_PASSWORD", "x");
        env.setProperty("ADMIN_EMAIL", "a@b.c");
        env.setProperty("DATABASE_URL", "postgresql://u:p@h:5432/d");
        new ProductionEnvironmentPostProcessor().postProcessEnvironment(env, new SpringApplication());
        assertEquals("jdbc:postgresql://h:5432/d", env.getProperty("spring.datasource.url"));
        assertEquals("u", env.getProperty("spring.datasource.username"));
    }

    @Test
    void otherProfilesAreUntouched() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");
        new ProductionEnvironmentPostProcessor().postProcessEnvironment(env, new SpringApplication());
        assertNull(env.getProperty("spring.datasource.url"));
    }
}
