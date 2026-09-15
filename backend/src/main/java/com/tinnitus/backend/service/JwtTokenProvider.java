package com.tinnitus.backend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Componente para generación y validación de tokens JWT.
 *
 * Hay dos tipos de token, distinguidos por el claim "type":
 * - "access": vida corta (jwt.access-expiration, 15 min por defecto). Viaja en el
 *   header Authorization y es el único tipo que JwtAuthenticationFilter acepta
 *   para autenticar requests.
 * - "refresh": vida larga (jwt.refresh-expiration, 7 días por defecto). Se
 *   entrega SOLO en una cookie HttpOnly (ver AuthController) y solo sirve para
 *   pedir un access token nuevo en POST /api/v1/auth/refresh.
 *
 * Seguridad: la clave se toma de jwt.secret (requerida en prod via env var). En
 * dev, si está vacía, se genera una aleatoria (los tokens quedan inválidos tras
 * reiniciar el servidor).
 */
@Component
public class JwtTokenProvider {

    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    @Value("${jwt.secret:default-secret-change-in-production}")
    private String jwtSecret;

    @Value("${jwt.access-expiration:900000}")
    private int accessExpiration;

    @Value("${jwt.refresh-expiration:604800000}")
    private int refreshExpiration;

    private Key key;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } else {
            byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
        }
    }

    /** Genera un access token (15 min) con los datos del usuario autenticado. */
    public String generateToken(Authentication authentication) {
        return generateAccessToken(authentication.getName());
    }

    /** Genera un access token (15 min) directamente desde el username. */
    public String generateToken(String username) {
        return generateAccessToken(username);
    }

    public String generateAccessToken(String username) {
        return buildToken(username, TYPE_ACCESS, accessExpiration);
    }

    /** Genera un refresh token (7 días). Solo debe viajar en una cookie HttpOnly. */
    public String generateRefreshToken(String username) {
        return buildToken(username, TYPE_REFRESH, refreshExpiration);
    }

    private String buildToken(String username, String type, int expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(username)
                .claim(CLAIM_TYPE, type)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Vida útil del refresh token en milisegundos (para calcular el Max-Age de la cookie). */
    public long getRefreshExpirationMillis() {
        return refreshExpiration;
    }

    /**
     * Construye un objeto Authentication a partir de un token JWT válido.
     * Carga los detalles del usuario desde la base de datos.
     */
    public Authentication getAuthentication(String token) {
        String username = getUserNameFromJwt(token);
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    /** Extrae el nombre de usuario del cuerpo del token JWT. */
    public String getUserNameFromJwt(String token) {
        return parseClaims(token).getSubject();
    }

    /** true si el token es válido (firma + expiración) y es de tipo "access". */
    public boolean isAccessToken(String token) {
        return validateToken(token) && TYPE_ACCESS.equals(getTypeFromJwt(token));
    }

    /** true si el token es válido (firma + expiración) y es de tipo "refresh". */
    public boolean isRefreshToken(String token) {
        return validateToken(token) && TYPE_REFRESH.equals(getTypeFromJwt(token));
    }

    private String getTypeFromJwt(String token) {
        Object type = parseClaims(token).get(CLAIM_TYPE);
        // Tokens emitidos antes de este cambio no traen el claim "type": se tratan
        // como access token para no invalidar sesiones activas en el despliegue.
        return type != null ? type.toString() : TYPE_ACCESS;
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Valida la firma y la expiración del token JWT.
     * Retorna false en lugar de lanzar excepción para no exponer detalles internos.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** Extrae el token JWT del header Authorization (formato: Bearer {token}). */
    public static String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
