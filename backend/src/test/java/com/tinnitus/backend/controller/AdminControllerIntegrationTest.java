package com.tinnitus.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void stats_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void stats_withFakeToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats")
                        .header("Authorization", "Bearer fake.jwt.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void users_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void alerts_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/alerts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void exportThi_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/export/research/thi?format=csv"))
                .andExpect(status().isUnauthorized());
    }
}
