package com.stock.analysis.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityEndpointProtectionTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Unauthenticated request to protected admin endpoint should return 401 or 403")
    void testUnauthenticatedAccessToAdminFails() throws Exception {
        mockMvc.perform(get("/api/v1/admin/announcements"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "regular_user", roles = {"USER"})
    @DisplayName("User with ROLE_USER attempting to access admin endpoint should return 403 Forbidden")
    void testUserRoleForbiddenForAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/admin/announcements"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin_user", roles = {"ADMIN"})
    @DisplayName("User with ROLE_ADMIN should successfully access admin endpoint")
    void testAdminRoleAccessesAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/admin/announcements"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SQL Injection payloads in authentication request should be rejected safely")
    void testSqlInjectionPayloadRejection() throws Exception {
        String sqlInjectionBody = """
                {
                    "usernameOrEmail": "' OR '1'='1",
                    "password": "' OR '1'='1"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sqlInjectionBody))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("XSS attack vectors in payload should not trigger server errors")
    void testXssPayloadHandling() throws Exception {
        String xssBody = """
                {
                    "usernameOrEmail": "<script>alert('xss')</script>",
                    "password": "Password123!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(xssBody))
                .andExpect(status().is4xxClientError());
    }
}
