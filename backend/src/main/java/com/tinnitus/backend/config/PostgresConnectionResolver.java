package com.tinnitus.backend.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;

/**
 * Convierte la configuracion de Postgres que inyecta la plataforma (Railway) a una URL JDBC.
 * Orden: DATABASE_URL (jdbc: o postgres[ql]://usuario:clave@host:puerto/db), luego PGHOST/PGPORT/PGDATABASE/
 * PGUSER/PGPASSWORD. DATABASE_USERNAME / DATABASE_PASSWORD, si existen, tienen prioridad sobre lo que traiga la URL.
 * Clase pura (sin Spring) para poder probarla. SECURITY: los mensajes de error nunca incluyen la clave ni la URL.
 */
public final class PostgresConnectionResolver {

    /** Resultado: url JDBC sin credenciales embebidas, usuario y clave (pueden ser null). */
    public record Result(String jdbcUrl, String username, String password) {
        @Override
        public String toString() {
            return "Result[jdbcUrl=" + jdbcUrl + ", username=" + username + ", password=***]";
        }
    }

    private PostgresConnectionResolver() {}

    /** @param env lectura de variables (nombre -> valor o null) @return null si no hay configuracion de BD */
    public static Result resolve(Function<String, String> env) {
        String databaseUrl = blankToNull(env.apply("DATABASE_URL"));
        String user = blankToNull(env.apply("DATABASE_USERNAME"));
        String pass = blankToNull(env.apply("DATABASE_PASSWORD"));

        if (databaseUrl != null) {
            if (databaseUrl.startsWith("jdbc:")) {
                return new Result(databaseUrl, user != null ? user : blankToNull(env.apply("PGUSER")),
                        pass != null ? pass : blankToNull(env.apply("PGPASSWORD")));
            }
            if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                return fromUri(databaseUrl, user, pass);
            }
            throw new IllegalStateException(
                    "DATABASE_URL debe empezar por jdbc:postgresql://, postgresql:// o postgres://");
        }

        String host = blankToNull(env.apply("PGHOST"));
        if (host != null) {
            String port = blankToNull(env.apply("PGPORT"));
            String db = blankToNull(env.apply("PGDATABASE"));
            if (db == null) {
                throw new IllegalStateException("PGHOST esta definido pero falta PGDATABASE");
            }
            String url = "jdbc:postgresql://" + host + ":" + (port != null ? port : "5432") + "/" + db;
            return new Result(url, user != null ? user : blankToNull(env.apply("PGUSER")),
                    pass != null ? pass : blankToNull(env.apply("PGPASSWORD")));
        }
        return null;
    }

    private static Result fromUri(String raw, String userOverride, String passOverride) {
        URI uri;
        try {
            uri = URI.create(raw);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("DATABASE_URL no es una URI valida (revisa caracteres especiales)");
        }
        if (uri.getHost() == null) {
            throw new IllegalStateException("DATABASE_URL no incluye host");
        }
        String user = null;
        String pass = null;
        String userInfo = uri.getRawUserInfo();
        if (userInfo != null) {
            int idx = userInfo.indexOf(':');
            user = decode(idx >= 0 ? userInfo.substring(0, idx) : userInfo);
            pass = idx >= 0 ? decode(userInfo.substring(idx + 1)) : null;
        }
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getRawPath() == null ? "" : uri.getRawPath();
        String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
        String url = "jdbc:postgresql://" + uri.getHost() + ":" + port + path + query;
        return new Result(url, userOverride != null ? userOverride : user, passOverride != null ? passOverride : pass);
    }

    private static String decode(String s) {
        return URLDecoder.decode(s.replace("+", "%2B"), StandardCharsets.UTF_8);
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
