package com.stock.analysis.notification;

import com.stock.analysis.notification.domain.NotificationPreference;
import com.stock.analysis.notification.dto.NotificationPreferenceRequest;
import com.stock.analysis.notification.dto.NotificationPreferenceResponse;
import com.stock.analysis.notification.mapper.NotificationMapper;
import com.stock.analysis.notification.repository.NotificationPreferenceRepository;
import com.stock.analysis.notification.service.NotificationPreferenceService;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationPreferenceServiceTest {

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationPreferenceService preferenceService;

    private User user;
    private UUID userId;
    private NotificationPreference preference;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder().id(userId).username("trader1").build();
        preference = NotificationPreference.builder()
                .user(user)
                .emailEnabled(true)
                .inAppEnabled(true)
                .tradingAlerts(true)
                .build();
    }

    @Test
    @DisplayName("Should fetch user preferences successfully")
    void testGetPreferences() {
        NotificationPreferenceResponse responseDto = NotificationPreferenceResponse.builder()
                .userId(userId)
                .emailEnabled(true)
                .inAppEnabled(true)
                .build();

        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(preference));
        when(notificationMapper.toPreferenceResponse(preference)).thenReturn(responseDto);

        NotificationPreferenceResponse result = preferenceService.getPreferences(userId);

        assertThat(result).isNotNull();
        assertThat(result.isEmailEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should update user preferences successfully")
    void testUpdatePreferences() {
        NotificationPreferenceRequest request = NotificationPreferenceRequest.builder()
                .emailEnabled(false)
                .smsEnabled(true)
                .build();

        NotificationPreference updatedPref = NotificationPreference.builder()
                .user(user)
                .emailEnabled(false)
                .smsEnabled(true)
                .build();

        NotificationPreferenceResponse responseDto = NotificationPreferenceResponse.builder()
                .userId(userId)
                .emailEnabled(false)
                .smsEnabled(true)
                .build();

        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(preference));
        when(preferenceRepository.save(any(NotificationPreference.class))).thenReturn(updatedPref);
        when(notificationMapper.toPreferenceResponse(updatedPref)).thenReturn(responseDto);

        NotificationPreferenceResponse result = preferenceService.updatePreferences(userId, request);

        assertThat(result.isEmailEnabled()).isFalse();
        assertThat(result.isSmsEnabled()).isTrue();
    }
}
