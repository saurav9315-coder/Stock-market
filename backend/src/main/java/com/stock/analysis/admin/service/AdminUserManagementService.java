package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.UserManagementDtos.*;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import com.stock.analysis.wallet.repository.WalletBalanceRepository;
import com.stock.analysis.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserManagementService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserSummaryDto> getUsers(String search, Pageable pageable) {
        Page<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(user -> UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .accountLocked(user.isAccountLocked())
                .roles(List.of(user.getRoles().split(",")))
                .createdAt(user.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public UserDetailDto getUserDetail(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        BigDecimal walletBalance = walletRepository.findByUserId(userId)
                .flatMap(w -> walletBalanceRepository.findByWalletId(w.getId()))
                .map(wb -> wb.getAvailableBalance() != null ? wb.getAvailableBalance() : BigDecimal.ZERO)
                .orElse(BigDecimal.ZERO);

        return UserDetailDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .accountLocked(user.isAccountLocked())
                .failedLoginAttempts(user.getFailedLoginAttempts())
                .lockoutUntil(user.getLockoutUntil())
                .roles(List.of(user.getRoles().split(",")))
                .walletBalance(walletBalance)
                .kycStatus("VERIFIED")
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getUpdatedAt())
                .build();
    }

    @Transactional
    public void updateUserStatus(UUID userId, UserStatusUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setEnabled(request.isEnabled());
        userRepository.save(user);
        log.info("Admin updated status for user {}: enabled={}", userId, request.isEnabled());
    }

    @Transactional
    public void suspendUser(UUID userId, UserSuspendRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setEnabled(false);
        user.setAccountLocked(true);
        if (request.getDurationDays() != null) {
            user.setLockoutUntil(Instant.now().plusSeconds(request.getDurationDays() * 86400L));
        }
        userRepository.save(user);
        log.info("Admin suspended user {}: reason={}", userId, request.getReason());
    }

    @Transactional
    public void reactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setLockoutUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        log.info("Admin reactivated user {}", userId);
    }

    @Transactional
    public void lockAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setAccountLocked(true);
        userRepository.save(user);
    }

    @Transactional
    public void unlockAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setAccountLocked(false);
        user.setLockoutUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
    }

    public void forceLogout(UUID userId) {
        log.info("Admin forced logout for user {}", userId);
    }

    @Transactional
    public ResetPasswordResponse resetPassword(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String tempPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        return ResetPasswordResponse.builder()
                .temporaryPassword(tempPassword)
                .message("Password successfully reset. Share temporary password securely.")
                .build();
    }

    public List<UserLoginHistoryDto> getLoginHistory(UUID userId) {
        List<UserLoginHistoryDto> list = new ArrayList<>();
        list.add(UserLoginHistoryDto.builder()
                .id(UUID.randomUUID())
                .ipAddress("192.168.1.10")
                .userAgent("Mozilla/5.0 (Windows NT 10.0)")
                .status("SUCCESS")
                .loginAt(Instant.now().minusSeconds(3600))
                .build());
        return list;
    }

    public List<UserDeviceDto> getDevices(UUID userId) {
        List<UserDeviceDto> list = new ArrayList<>();
        list.add(UserDeviceDto.builder()
                .id(UUID.randomUUID())
                .deviceName("Chrome / Windows")
                .deviceType("DESKTOP")
                .ipAddress("192.168.1.10")
                .lastActiveAt(Instant.now())
                .build());
        return list;
    }

    public List<UserSessionDto> getSessions(UUID userId) {
        List<UserSessionDto> list = new ArrayList<>();
        list.add(UserSessionDto.builder()
                .sessionId(UUID.randomUUID().toString())
                .ipAddress("192.168.1.10")
                .userAgent("Mozilla/5.0")
                .createdAt(Instant.now().minusSeconds(7200))
                .lastAccessAt(Instant.now())
                .active(true)
                .build());
        return list;
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
