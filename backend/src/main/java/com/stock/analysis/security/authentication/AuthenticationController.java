package com.stock.analysis.security.authentication;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.security.authentication.dto.ChangePasswordRequest;
import com.stock.analysis.security.authentication.dto.ForgotPasswordRequest;
import com.stock.analysis.security.authentication.dto.LoginRequest;
import com.stock.analysis.security.authentication.dto.LoginResponse;
import com.stock.analysis.security.authentication.dto.RegisterRequest;
import com.stock.analysis.security.authentication.dto.ResetPasswordRequest;
import com.stock.analysis.security.authentication.dto.TokenRefreshRequest;
import com.stock.analysis.security.authentication.dto.TokenRefreshResponse;
import com.stock.analysis.security.authentication.dto.UserProfileResponse;
import com.stock.analysis.users.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Endpoints for registration, login, logout, token rotation, and credential recoveries")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account", description = "Signs up a user in GUEST state and dispatches an activation token to log files.")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest request) {
        authenticationService.register(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Registration successful. Please check your logs/email for the account activation link.",
                null
        ));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Verifies user password, increments failed attempt locks, checks activation, and returns JWT payloads.")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate active session", description = "Revokes user refresh token databases and blacklists access JWT signatures in Redis.")
    public ResponseEntity<ApiResponse<Object>> logout(
            @Parameter(description = "Bearer <Token>") @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "refreshToken", required = false) String refreshToken) {
        authenticationService.logout(authHeader, refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token payload", description = "Rotates current refresh token to issue a fresh access token (sliding session structure).")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authenticationService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Access token successfully refreshed", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password recovery link", description = "Triggers an expiring password reset token for valid emails.")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If the email address exists, a password reset link has been dispatched to your logs/mailbox.",
                null
        ));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset account credentials using recovery token", description = "Resets password if token is valid and new password does not violate reuse policies.")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully.", null));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password in-session", description = "Updates password if the current password is valid and history policies permit.")
    public ResponseEntity<ApiResponse<Object>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        authenticationService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.success("Password has been changed successfully.", null));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify account activation token", description = "Verifies token, flags email as verified, and elevates roles to VERIFIED_USER.")
    public ResponseEntity<ApiResponse<Object>> verifyEmail(@RequestParam("token") String token) {
        authenticationService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. Account is now active.", null));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Regenerate activation token link", description = "Dispatches a new email verification code.")
    public ResponseEntity<ApiResponse<Object>> resendVerification(@RequestParam("email") String email) {
        authenticationService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Verification link has been sent.", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Fetch current user profile details", description = "Resolves authenticated context user credentials, roles, and authorization scopes.")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@AuthenticationPrincipal User user) {
        UserProfileResponse profile = authenticationService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }
}
