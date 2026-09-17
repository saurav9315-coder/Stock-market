package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.UserManagementDtos.ResetPasswordResponse;
import com.stock.analysis.admin.dto.UserManagementDtos.UserSuspendRequest;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import com.stock.analysis.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserManagementService userService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .username("trader1")
                .email("trader1@stock.com")
                .enabled(true)
                .accountLocked(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully suspend user")
    void testSuspendUserSuccess() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserSuspendRequest request = UserSuspendRequest.builder()
                .reason("Suspicious trading velocity")
                .durationDays(7)
                .build();

        userService.suspendUser(userId, request);

        assertThat(user.isEnabled()).isFalse();
        assertThat(user.isAccountLocked()).isTrue();
        assertThat(user.getLockoutUntil()).isNotNull();
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should successfully reactivate user")
    void testReactivateUserSuccess() {
        user.setEnabled(false);
        user.setAccountLocked(true);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.reactivateUser(userId);

        assertThat(user.isEnabled()).isTrue();
        assertThat(user.isAccountLocked()).isFalse();
        assertThat(user.getLockoutUntil()).isNull();
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should reset password and return temporary credentials")
    void testResetPasswordSuccess() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(any())).thenReturn("encodedTempPassword");

        ResetPasswordResponse response = userService.resetPassword(userId);

        assertThat(response).isNotNull();
        assertThat(response.getTemporaryPassword()).isNotNull().hasSize(12);
        verify(userRepository).save(user);
    }
}
