package com.stock.analysis.security.authentication;

import com.stock.analysis.exception.AccountLockedException;
import com.stock.analysis.exception.EmailNotVerifiedException;
import com.stock.analysis.exception.InvalidCredentialsException;
import com.stock.analysis.exception.PasswordPolicyException;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.exception.TokenRefreshException;
import com.stock.analysis.security.authentication.dto.ChangePasswordRequest;
import com.stock.analysis.security.authentication.dto.ForgotPasswordRequest;
import com.stock.analysis.security.authentication.dto.LoginRequest;
import com.stock.analysis.security.authentication.dto.LoginResponse;
import com.stock.analysis.security.authentication.dto.RegisterRequest;
import com.stock.analysis.security.authentication.dto.ResetPasswordRequest;
import com.stock.analysis.security.authentication.dto.TokenRefreshRequest;
import com.stock.analysis.security.authentication.dto.TokenRefreshResponse;
import com.stock.analysis.security.authentication.dto.UserProfileResponse;
import com.stock.analysis.security.jwt.JwtTokenProvider;
import com.stock.analysis.security.jwt.TokenBlacklistService;
import com.stock.analysis.users.PasswordHistory;
import com.stock.analysis.users.PasswordHistoryRepository;
import com.stock.analysis.users.RoleEntity;
import com.stock.analysis.users.RoleRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class AuthenticationService {

    private static final Logger auditLog = LoggerFactory.getLogger("com.stock.analysis.audit");

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;
    private static final int PASSWORD_HISTORY_LIMIT = 3;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    public AuthenticationService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordHistoryRepository passwordHistoryRepository,
            VerificationTokenRepository verificationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            RefreshTokenService refreshTokenService,
            TokenBlacklistService tokenBlacklistService,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordHistoryRepository = passwordHistoryRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new PasswordPolicyException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new PasswordPolicyException("Email already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        RoleEntity defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(RoleEntity.builder().name("ROLE_USER").build()));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(encodedPassword)
                .rolesSet(new java.util.HashSet<>(java.util.List.of(defaultRole)))
                .emailVerified(false)
                .accountLocked(false)
                .failedLoginAttempts(0)
                .passwordChangedAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        // Record initial password in history
        savePasswordToHistory(savedUser, encodedPassword);

        // Create email verification token
        generateAndSendVerificationToken(savedUser);

        auditLog.info("REGISTRATION_SUCCESS: User '{}' successfully registered. Email: {}", savedUser.getUsername(), savedUser.getEmail());
        return savedUser;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> {
                    auditLog.warn("LOGIN_FAILED: Attempted login for invalid user '{}'", request.getUsernameOrEmail());
                    return new InvalidCredentialsException("Invalid username or password");
                });

        // 1. Lockout Check
        if (user.isAccountLocked()) {
            if (user.isLockoutExpired()) {
                user.setAccountLocked(false);
                user.setFailedLoginAttempts(0);
                user.setLockoutUntil(null);
                userRepository.save(user);
                auditLog.info("ACCOUNT_UNLOCKED: Lock expired for user '{}'. Account unlocked.", user.getUsername());
            } else {
                auditLog.warn("LOGIN_FAILED: User '{}' locked out. Remaining block: {}", user.getUsername(), user.getLockoutUntil());
                throw new AccountLockedException("Account is locked. Please try again later.");
            }
        }

        // 2. Password Check
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setAccountLocked(true);
                user.setLockoutUntil(Instant.now().plus(LOCKOUT_DURATION_MINUTES, ChronoUnit.MINUTES));
                userRepository.save(user);
                auditLog.error("ACCOUNT_LOCKED: User '{}' locked due to {} failed credentials checks.", user.getUsername(), attempts);
                throw new AccountLockedException("Too many failed attempts. Account locked for 15 minutes.");
            }
            
            userRepository.save(user);
            auditLog.warn("LOGIN_FAILED: Failed password attempt {}/{} for user '{}'", attempts, MAX_FAILED_ATTEMPTS, user.getUsername());
            throw new InvalidCredentialsException("Invalid username or password");
        }

        // 3. Email Verification Check
        if (!user.isEmailVerified()) {
            auditLog.warn("LOGIN_FAILED: Verified access block for user '{}'", user.getUsername());
            throw new EmailNotVerifiedException("Please verify your email address before logging in.");
        }

        // Reset failed login tracker
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        // Generate Access & Refresh tokens
        String accessToken = jwtTokenProvider.generateToken(user.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        List<String> roles = Arrays.stream(user.getRoles().split(","))
                .map(String::trim)
                .toList();

        List<String> permissions = user.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .toList();

        auditLog.info("LOGIN_SUCCESS: User '{}' successfully logged in.", user.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    @Transactional
    public void logout(String authHeader, String refreshToken) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsernameFromJWT(token);
            userRepository.findByUsername(username).ifPresent(user -> {
                // Revoke db refresh tokens
                refreshTokenService.revokeByUser(user);
                auditLog.info("LOGOUT_SUCCESS: User '{}' session terminated.", user.getUsername());
            });

            // Blacklist the access token in Redis for its remaining lifespan
            tokenBlacklistService.blacklistToken(token, accessTokenExpirationMs);
        }

        if (refreshToken != null) {
            refreshTokenService.rotateRefreshToken(refreshToken); // Set as revoked for session cancellation
        }
    }

    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        RefreshToken rotatedToken = refreshTokenService.rotateRefreshToken(request.getRefreshToken());
        User user = rotatedToken.getUser();
        String newAccessToken = jwtTokenProvider.generateToken(user.getUsername());

        auditLog.info("TOKEN_ROTATED: Session extended for user '{}'", user.getUsername());
        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(rotatedToken.getToken())
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresentOrElse(user -> {
            // Delete previous token if exists
            passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

            String resetToken = UUID.randomUUID().toString();
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user)
                    .token(resetToken)
                    .expiryDate(Instant.now().plus(1, ChronoUnit.HOURS)) // Expires in 1 hour
                    .build();

            passwordResetTokenRepository.save(token);

            // Print link to console for mock demonstration (production uses transactional mailer)
            log.info("PASSWORD_RESET_LINK: Send this link to {}: http://localhost:8080/api/v1/auth/reset-password?token={}", 
                    user.getEmail(), resetToken);
            auditLog.info("PASSWORD_RESET_REQUEST: Recovery token dispatched to '{}'", user.getEmail());
        }, () -> {
            // Log for audit but return silent success to UI
            auditLog.warn("PASSWORD_RESET_REJECTED: Recovery requested for non-existent email '{}'", request.getEmail());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new TokenRefreshException(request.getToken(), "Password reset token has expired");
        }

        User user = resetToken.getUser();

        // Enforce password history checks
        verifyPasswordHistory(user, request.getNewPassword());

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedPassword);
        user.setPasswordChangedAt(Instant.now());
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        // Record history
        savePasswordToHistory(user, encodedPassword);

        // Delete reset token
        passwordResetTokenRepository.delete(resetToken);

        auditLog.info("PASSWORD_RESET_SUCCESS: User '{}' updated credential hash via verification link.", user.getUsername());
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password does not match");
        }

        verifyPasswordHistory(user, request.getNewPassword());

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedPassword);
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        savePasswordToHistory(user, encodedPassword);

        auditLog.info("PASSWORD_CHANGE_SUCCESS: User '{}' updated credentials in-session.", user.getUsername());
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired email verification token"));

        if (verificationToken.isExpired()) {
            verificationTokenRepository.delete(verificationToken);
            throw new TokenRefreshException(tokenValue, "Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        
        RoleEntity userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(RoleEntity.builder().name("ROLE_USER").build()));
        RoleEntity verifiedRole = roleRepository.findByName("ROLE_VERIFIED_USER")
                .orElseGet(() -> roleRepository.save(RoleEntity.builder().name("ROLE_VERIFIED_USER").build()));
        
        user.getRolesSet().clear();
        user.getRolesSet().add(userRole);
        user.getRolesSet().add(verifiedRole);
        
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);

        auditLog.info("EMAIL_VERIFICATION_SUCCESS: User '{}' activated their account.", user.getUsername());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + email));

        if (user.isEmailVerified()) {
            throw new PasswordPolicyException("Email address is already verified");
        }

        verificationTokenRepository.findByUser(user).ifPresent(verificationTokenRepository::delete);
        generateAndSendVerificationToken(user);

        auditLog.info("EMAIL_VERIFICATION_DISPATCHED: Verification token resent to '{}'", email);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User user) {
        List<String> roles = Arrays.stream(user.getRoles().split(","))
                .map(String::trim)
                .toList();

        List<String> permissions = user.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .filter(auth -> !auth.startsWith("ROLE_"))
                .toList();

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .emailVerified(user.isEmailVerified())
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    // Helper generating activation tokens
    private void generateAndSendVerificationToken(User user) {
        String code = UUID.randomUUID().toString();
        VerificationToken token = VerificationToken.builder()
                .user(user)
                .token(code)
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS)) // Expires in 24 hours
                .build();

        verificationTokenRepository.save(token);

        // Production integrates an email dispatcher. Dev mocks link to server output stream.
        log.info("EMAIL_ACTIVATION_LINK: Send this link to {}: http://localhost:8080/api/v1/auth/verify-email?token={}", 
                user.getEmail(), code);
    }

    private void savePasswordToHistory(User user, String encodedPassword) {
        PasswordHistory history = PasswordHistory.builder()
                .user(user)
                .passwordHash(encodedPassword)
                .build();
        passwordHistoryRepository.save(history);
    }

    private void verifyPasswordHistory(User user, String newPassword) {
        List<String> recentHashes = passwordHistoryRepository.findRecentPasswordHashes(
                user.getId(), PageRequest.of(0, PASSWORD_HISTORY_LIMIT)
        );

        for (String oldHash : recentHashes) {
            if (passwordEncoder.matches(newPassword, oldHash)) {
                throw new PasswordPolicyException("Password cannot be one of the last " + PASSWORD_HISTORY_LIMIT + " used passwords.");
            }
        }
    }
}
