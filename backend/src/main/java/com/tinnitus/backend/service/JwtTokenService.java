package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.JwtToken;
import com.tinnitus.backend.repository.JwtTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class JwtTokenService {

    @Autowired
    private JwtTokenRepository jwtTokenRepository;

    public Optional<JwtToken> findByToken(String token) {
        return jwtTokenRepository.findByToken(token);
    }

    public JwtToken saveToken(JwtToken jwtToken) {
        return jwtTokenRepository.save(jwtToken);
    }

    public void deleteToken(String token) {
        jwtTokenRepository.deleteByToken(token);
    }

    /**
     * Revoca un token JWT guardándolo en la tabla de tokens revocados.
     * El JwtAuthenticationFilter debe verificar esta lista.
     */
    public void revokeToken(String token) {
        if (!jwtTokenRepository.findByToken(token).isPresent()) {
            JwtToken jt = new JwtToken();
            jt.setToken(token);
            jwtTokenRepository.save(jt);
        }
    }

    public boolean isTokenRevoked(String token) {
        return jwtTokenRepository.findByToken(token).isPresent();
    }
}