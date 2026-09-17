package com.stock.analysis.security.authentication;

import com.stock.analysis.exception.TokenRefreshException;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final long refreshTokenDurationMs;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            @Value("${app.jwt.refresh-token-expiration-ms}") long refreshTokenDurationMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.refreshTokenDurationMs = refreshTokenDurationMs;
    }

    @Transactional
    public RefreshToken createRefreshToken(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Revoke existing tokens for cleanliness or let sliding window run
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional(noRollbackFor = TokenRefreshException.class)
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token has expired. Please login again.");
        }
        if (token.isRevoked()) {
            throw new TokenRefreshException(token.getToken(), "Refresh token has been revoked.");
        }
        return token;
    }

    /**
     * Rotates a refresh token. Evaluates token reuse to trigger active breach containment.
     *
     * @param tokenValue - the incoming refresh token value to exchange
     * @return the newly issued RefreshToken object
     */
    @Transactional
    public RefreshToken rotateRefreshToken(String tokenValue) {
        Optional<RefreshToken> optionalToken = refreshTokenRepository.findByToken(tokenValue);

        if (optionalToken.isEmpty()) {
            // Token does not exist - this indicates possible token fabrication or database sync mismatch
            throw new TokenRefreshException(tokenValue, "Invalid refresh token");
        }

        RefreshToken token = optionalToken.get();

        if (token.isRevoked() || token.isExpired()) {
            // BREACH DETECTION: This token has already been revoked or is expired.
            // If a client attempts to reuse a token, we assume it was compromised (stolen from client storage).
            log.error("CRITICAL SECURITY ALERT: Refresh token reuse detected for user [{}]. Revoking all active tokens!", 
                    token.getUser().getUsername());
            
            // Revoke all sessions for this compromised user
            refreshTokenRepository.deleteByUser(token.getUser());
            
            throw new TokenRefreshException(tokenValue, "Token reuse detected. All active sessions revoked for security.");
        }

        // Token is valid. Rotate it.
        // 1. Revoke the current token
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        // 2. Generate a new token
        RefreshToken newToken = RefreshToken.builder()
                .user(token.getUser())
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void revokeByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
