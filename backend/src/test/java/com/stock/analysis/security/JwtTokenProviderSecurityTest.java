package com.stock.analysis.security;

import com.stock.analysis.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderSecurityTest {

    // 256-bit base64 secret string for testing
    private static final String SECRET = "dGhpc0lzQVNlY3JldEtleUZvckpXVENyZWF0aW9uQW5kVmFsaWRhdGlvbkludGVncmF0aW9uVGVzdHMxMjM0NTY=";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Should generate valid JWT token for username")
    void testGenerateTokenFromUsername() {
        String token = jwtTokenProvider.generateToken("trader_john");

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUsernameFromJWT(token)).isEqualTo("trader_john");
    }

    @Test
    @DisplayName("Should generate valid JWT token from Authentication principal")
    void testGenerateTokenFromAuthentication() {
        UserDetails userDetails = new User("admin_user", "password123", Collections.emptyList());
        when(authentication.getPrincipal()).thenReturn(userDetails);

        String token = jwtTokenProvider.generateToken(authentication);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUsernameFromJWT(token)).isEqualTo("admin_user");
    }

    @Test
    @DisplayName("Should reject invalid or tampered JWT token")
    void testValidateTamperedToken() {
        String validToken = jwtTokenProvider.generateToken("valid_user");
        String tamperedToken = validToken + "tampered_suffix";

        boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should reject token signed with different secret key")
    void testValidateTokenWithDifferentSecret() {
        String otherSecret = "YW5vdGhlclNlY3JldEtleUZvckpXVENyZWF0aW9uQW5kVmFsaWRhdGlvbkludGVncmF0aW9uVGVzdHMxMjM0NTY=";
        JwtTokenProvider otherProvider = new JwtTokenProvider(otherSecret, EXPIRATION_MS);

        String tokenFromOther = otherProvider.generateToken("compromised_user");

        boolean isValid = jwtTokenProvider.validateToken(tokenFromOther);

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should reject expired token")
    void testExpiredTokenRejection() {
        JwtTokenProvider expiredProvider = new JwtTokenProvider(SECRET, -1000); // Expiration in the past
        String expiredToken = expiredProvider.generateToken("expired_user");

        boolean isValid = jwtTokenProvider.validateToken(expiredToken);

        assertThat(isValid).isFalse();
    }
}
