package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class UserManagementDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDto {
        private UUID id;
        private String username;
        private String email;
        private String phoneNumber;
        private boolean enabled;
        private boolean emailVerified;
        private boolean accountLocked;
        private List<String> roles;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDetailDto {
        private UUID id;
        private String username;
        private String email;
        private String phoneNumber;
        private boolean enabled;
        private boolean emailVerified;
        private boolean accountLocked;
        private int failedLoginAttempts;
        private Instant lockoutUntil;
        private List<String> roles;
        private BigDecimal walletBalance;
        private String kycStatus;
        private Instant createdAt;
        private Instant lastLoginAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatusUpdateRequest {
        private boolean enabled;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSuspendRequest {
        private String reason;
        private Integer durationDays; // null for permanent
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordResponse {
        private String temporaryPassword;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLoginHistoryDto {
        private UUID id;
        private String ipAddress;
        private String userAgent;
        private String status; // SUCCESS, FAILED
        private Instant loginAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDeviceDto {
        private UUID id;
        private String deviceName;
        private String deviceType;
        private String ipAddress;
        private Instant lastActiveAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSessionDto {
        private String sessionId;
        private String ipAddress;
        private String userAgent;
        private Instant createdAt;
        private Instant lastAccessAt;
        private boolean active;
    }
}
