package com.tinnitus.backend.controller;

import com.tinnitus.backend.ai.FirebaseTokenVerifier;
import com.tinnitus.backend.ai.FirebaseTokenVerifier.VerifiedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** SEC-15 / AI-10: firebase-login solo confía en el ID token verificado. */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "app.admin.email=boss@test.example",
        // BD aislada en memoria: nunca tocar la BD local/dev/prod
        "spring.datasource.url=jdbc:h2:mem:fbloginsec;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class FirebaseLoginSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FirebaseTokenVerifier verifier;

    @BeforeEach
    void setUp() {
        when(verifier.isAvailable()).thenReturn(true);
        when(verifier.verifyClaims(anyString())).thenReturn(Optional.empty());
    }

    private void valid(String token, String uid, String email, boolean verified) {
        when(verifier.verifyClaims(token)).thenReturn(Optional.of(new VerifiedUser(uid, email, verified, "N")));
    }

    @Test
    void missingToken_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/firebase-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"uid\":\"x\",\"email\":\"boss@test.example\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void invalidToken_returns401_evenIfBodyClaimsAdmin() throws Exception {
        mockMvc.perform(post("/api/v1/auth/firebase-login")
                        .header("Authorization", "Bearer bogus")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"uid\":\"x\",\"email\":\"boss@test.example\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void validToken_verifiedAdminEmail_getsAdmin() throws Exception {
        valid("t-admin", "uid-admin-1", "boss@test.example", true);
        mockMvc.perform(post("/api/v1/auth/firebase-login").header("Authorization", "Bearer t-admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    void validToken_unverifiedAdminEmail_doesNotGetAdmin() throws Exception {
        valid("t-unver", "uid-unver-1", "boss@test.example", false);
        mockMvc.perform(post("/api/v1/auth/firebase-login").header("Authorization", "Bearer t-unver"))
                .andExpect(result -> org.junit.jupiter.api.Assertions.assertFalse(
                        result.getResponse().getContentAsString().contains("ROLE_ADMIN"),
                        "email no verificado no debe obtener ROLE_ADMIN"));
    }

    @Test
    void validToken_regularUser_getsUserRole_bodyIgnored() throws Exception {
        valid("t-user", "uid-user-1", "user1@test.example", true);
        mockMvc.perform(post("/api/v1/auth/firebase-login")
                        .header("Authorization", "Bearer t-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"uid\":\"evil\",\"email\":\"boss@test.example\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_USER"))
                .andExpect(jsonPath("$.username").value("fb_uid-user-1"));
    }

    @Test
    void unverifiedRegularUser_canLoginAsUser() throws Exception {
        valid("t-user2", "uid-user-2", "user2@test.example", false);
        mockMvc.perform(post("/api/v1/auth/firebase-login").header("Authorization", "Bearer t-user2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    void firebaseAccounts_cannotUsePasswordLogin_withUidAsPassword() throws Exception {
        valid("t-user3", "uid-user-3", "user3@test.example", true);
        mockMvc.perform(post("/api/v1/auth/firebase-login").header("Authorization", "Bearer t-user3"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("username", "fb_uid-user-3")
                        .param("password", "uid-user-3"))
                .andExpect(status().isUnauthorized());
    }
}
