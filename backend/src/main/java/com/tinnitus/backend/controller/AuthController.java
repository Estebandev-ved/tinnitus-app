package com.tinnitus.backend.controller;

import com.tinnitus.backend.ai.FirebaseTokenVerifier;
import com.tinnitus.backend.dto.RegisterRequest;
import com.tinnitus.backend.dto.UserResponse;
import com.tinnitus.backend.model.dto.AuthResponse;
import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.model.entity.Role;
import com.tinnitus.backend.repository.UserRepository;
import com.tinnitus.backend.repository.RoleRepository;
import com.tinnitus.backend.service.AccountLockoutService;
import com.tinnitus.backend.service.JwtTokenProvider;
import com.tinnitus.backend.service.JwtTokenService;
import com.tinnitus.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Autenticación y gestión de sesiones")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private static final String REFRESH_COOKIE_PATH = "/api/v1/auth";
    private static final String FIREBASE_USER_PREFIX = "fb_";

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtTokenService jwtTokenService;
    private final AccountLockoutService lockoutService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final FirebaseTokenVerifier firebaseVerifier;

    @Value("${app.admin.email:grubiano23@gmail.com}")
    private String adminEmail;

    // SECURITY: en dev (http://localhost) se apaga el flag Secure de la cookie
    // via app.cookie.secure=false, porque los navegadores nunca mandan cookies
    // "Secure" sobre HTTP plano. En producción (HTTPS detrás de Nginx) queda en true.
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider,
                          JwtTokenService jwtTokenService,
                          AccountLockoutService lockoutService,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          FirebaseTokenVerifier firebaseVerifier) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtTokenService = jwtTokenService;
        this.lockoutService = lockoutService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.firebaseVerifier = firebaseVerifier;
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerUser(request.username(), request.email(), request.password(), "ROLE_USER");
        return new ResponseEntity<>(UserResponse.from(user), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión — entrega un access token (15 min) en el body " +
            "y un refresh token (7 días) en una cookie HttpOnly")
    public ResponseEntity<?> login(@RequestParam String username,
                                   @RequestParam String password,
                                   HttpServletResponse response) {
        // Las cuentas creadas vía Firebase no tienen contraseña utilizable: solo entran con ID token.
        if (username != null && username.startsWith(FIREBASE_USER_PREFIX)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales inválidas"));
        }
        if (lockoutService.isLocked(username)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Cuenta bloqueada temporalmente. Intenta de nuevo en 15 minutos.",
                                 "remainingAttempts", lockoutService.getRemainingAttempts(username)));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            lockoutService.clearFailures(username);

            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(authentication.getName());
            setRefreshCookie(response, refreshToken);

            String role = authentication.getAuthorities().stream()
                    .map(g -> g.getAuthority())
                    .findFirst()
                    .orElse("ROLE_USER");
            return ResponseEntity.ok(new AuthResponse(accessToken, username, role));
        } catch (AuthenticationException e) {
            lockoutService.recordFailure(username);
            int remaining = lockoutService.getRemainingAttempts(username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales inválidas",
                                 "remainingAttempts", remaining));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Cambia el refresh token (cookie) por un access token nuevo. " +
            "Rota el refresh token en cada uso.")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getRefreshTokenFromCookies(request);

        if (refreshToken == null
                || !jwtTokenProvider.isRefreshToken(refreshToken)
                || jwtTokenService.isTokenRevoked(refreshToken)) {
            clearRefreshCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Refresh token inválido o expirado. Vuelve a iniciar sesión."));
        }

        String username = jwtTokenProvider.getUserNameFromJwt(refreshToken);

        // Rotación: el refresh token usado queda inservible de inmediato.
        jwtTokenService.revokeToken(refreshToken);

        String newAccessToken = jwtTokenProvider.generateToken(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);
        setRefreshCookie(response, newRefreshToken);

        String role = userRepository.findByUsername(username)
                .map(u -> u.getRole() != null ? u.getRole().getName() : "ROLE_USER")
                .orElse("ROLE_USER");

        return ResponseEntity.ok(new AuthResponse(newAccessToken, username, role));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión (revoca access y refresh token)")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = JwtTokenProvider.getJwtFromRequest(request);
        if (accessToken != null) {
            jwtTokenService.revokeToken(accessToken);
        }
        String refreshToken = getRefreshTokenFromCookies(request);
        if (refreshToken != null) {
            jwtTokenService.revokeToken(refreshToken);
        }
        clearRefreshCookie(response);
        return ResponseEntity.ok(Map.of("message", "Sesión cerrada"));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener usuario actual")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !"ROLE_ANONYMOUS".equals(auth.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority()).orElse(null))) {
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null
                    || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }
        String username = auth.getName();
        User user = userService.loadUserEntityByUsername(username);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/firebase-login")
    @Operation(summary = "Login vía Firebase — verifica el ID token (Authorization: Bearer) con Firebase Admin, " +
            "crea/actualiza el usuario en backend y retorna JWT. uid/email se toman SOLO del token verificado.")
    public ResponseEntity<?> firebaseLogin(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletResponse response) {

        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.length() < 8) {
            return unauthenticated();
        }
        if (!firebaseVerifier.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "SERVICE_UNAVAILABLE"));
        }
        FirebaseTokenVerifier.VerifiedUser fb = firebaseVerifier.verifyClaims(authorization.substring(7).trim())
                .orElse(null);
        if (fb == null || fb.uid() == null || fb.email() == null || fb.email().isBlank()) {
            return unauthenticated();
        }

        String uid = fb.uid();
        String email = fb.email();
        String username = FIREBASE_USER_PREFIX + uid;
        boolean grantAdmin = fb.emailVerified() && email.equalsIgnoreCase(adminEmail);

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null && grantAdmin) {
            // Único enlace por email permitido: la cuenta admin sembrada (DataInitializer), con email verificado.
            user = userRepository.findByEmail(email).orElse(null);
        }

        if (user == null) {
            if (userRepository.findByEmail(email).isPresent()) {
                // Email ya usado por otra cuenta no vinculada: no se enlaza automáticamente.
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "ACCOUNT_UNAVAILABLE"));
            }
            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setEnabled(true);
        } else if (username.equals(user.getUsername())) {
            // Cuentas legadas tenían password = uid (público en Firestore): se rota a un valor aleatorio.
            if (passwordEncoder.matches(uid, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            }
            if (fb.emailVerified() && !email.equals(user.getEmail())
                    && userRepository.findByEmail(email).isEmpty()) {
                user.setEmail(email);
            }
        }

        if (grantAdmin) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_ADMIN");
                return roleRepository.save(r);
            });
            user.setRole(adminRole);
        } else if (user.getRole() == null) {
            Role userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
                Role r = new Role();
                r.setName("ROLE_USER");
                return roleRepository.save(r);
            });
            user.setRole(userRole);
        }

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
        setRefreshCookie(response, refreshToken);

        String role = user.getRole() != null ? user.getRole().getName() : "ROLE_USER";

        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), role));
    }

    private ResponseEntity<Map<String, String>> unauthenticated() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "UNAUTHENTICATED"));
    }

    // ---------- Cookie helpers ----------

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(jwtTokenProvider.getRefreshExpirationMillis() / 1000)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (jakarta.servlet.http.Cookie c : request.getCookies()) {
            if (REFRESH_COOKIE_NAME.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
}
