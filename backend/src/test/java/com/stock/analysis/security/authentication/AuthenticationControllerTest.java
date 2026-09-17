package com.stock.analysis.security.authentication;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.security.authentication.dto.LoginRequest;
import com.stock.analysis.security.authentication.dto.RegisterRequest;
import com.stock.analysis.users.RoleEntity;
import com.stock.analysis.users.RoleRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    // Mock Redis connections so the test context bootstraps cleanly without a running Redis server
    @MockBean
    private RedisTemplate<String, Object> redisTemplate;

    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockBean
    private org.springframework.data.redis.connection.ReactiveRedisConnectionFactory reactiveRedisConnectionFactory;

    @BeforeEach
    void setUp() {
        verificationTokenRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
        roleRepository.save(RoleEntity.builder().name("ROLE_USER").build());
        roleRepository.save(RoleEntity.builder().name("ROLE_VERIFIED_USER").build());
    }

    @Test
    void registerUserSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("stocktrader")
                .email("trader@company.com")
                .password("Password123!") // Valid strong password
                .phoneNumber("1234567890")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Registration successful. Please check your logs/email for the account activation link."));

        assertTrue(userRepository.findByUsername("stocktrader").isPresent());
        User user = userRepository.findByUsername("stocktrader").get();
        assertFalse(user.isEmailVerified()); // Default is unverified
    }

    @Test
    void registerUserInvalidPasswordFails() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("trader2")
                .email("trader2@company.com")
                .password("weak") // Fails ValidPassword constraints
                .phoneNumber("1234567890")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation error"))
                .andExpect(jsonPath("$.data.password").exists());
    }

    @Test
    void loginUnverifiedUserFails() throws Exception {
        // Setup unverified user
        RoleEntity userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
        User user = User.builder()
                .username("unverified")
                .email("unverified@company.com")
                .password(passwordEncoder.encode("Password123!"))
                .rolesSet(new java.util.HashSet<>(java.util.List.of(userRole)))
                .emailVerified(false) // Unverified
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("unverified")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Please verify your email address before logging in."));
    }

    @Test
    void verifyEmailAndLoginSuccess() throws Exception {
        // 1. Setup User and Activation Token
        RoleEntity userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
        User user = User.builder()
                .username("verify_me")
                .email("verify_me@company.com")
                .password(passwordEncoder.encode("Password123!"))
                .rolesSet(new java.util.HashSet<>(java.util.List.of(userRole)))
                .emailVerified(false)
                .build();
        User savedUser = userRepository.save(user);

        String activationToken = UUID.randomUUID().toString();
        VerificationToken token = VerificationToken.builder()
                .user(savedUser)
                .token(activationToken)
                .expiryDate(java.time.Instant.now().plusSeconds(3600))
                .build();
        verificationTokenRepository.save(token);

        // 2. Perform Verification
        mockMvc.perform(post("/auth/verify-email")
                        .param("token", activationToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully. Account is now active."));

        // Confirm DB state updated
        User updatedUser = userRepository.findById(savedUser.getId()).get();
        assertTrue(updatedUser.isEmailVerified());
        assertTrue(updatedUser.getRoles().contains("ROLE_VERIFIED_USER"));

        // 3. Login with verified account
        LoginRequest loginRequest = LoginRequest.builder()
                .usernameOrEmail("verify_me")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.refreshToken").exists())
                .andExpect(jsonPath("$.data.roles").value(org.hamcrest.Matchers.hasItem("ROLE_USER")))
                .andExpect(jsonPath("$.data.roles").value(org.hamcrest.Matchers.hasItem("ROLE_VERIFIED_USER")));
    }

    @Test
    void accessMeEndpointUnauthenticatedFails() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
