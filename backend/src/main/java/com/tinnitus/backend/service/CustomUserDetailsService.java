package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.User;
import com.tinnitus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_USER";
        String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority(authority))
                .build();
    }
}