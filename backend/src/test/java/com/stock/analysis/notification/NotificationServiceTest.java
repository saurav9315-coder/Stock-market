package com.stock.analysis.notification;

import com.stock.analysis.notification.channel.NotificationChannelDispatcher;
import com.stock.analysis.notification.domain.*;
import com.stock.analysis.notification.dto.NotificationResponse;
import com.stock.analysis.notification.dto.SendNotificationRequest;
import com.stock.analysis.notification.dto.UnreadCountResponse;
import com.stock.analysis.notification.mapper.NotificationMapper;
import com.stock.analysis.notification.repository.NotificationRepository;
import com.stock.analysis.notification.service.*;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationPreferenceService preferenceService;

    @Mock
    private NotificationDeduplicationService deduplicationService;

    @Mock
    private NotificationRateLimiterService rateLimiterService;

    @Mock
    private NotificationChannelDispatcher channelDispatcher;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationService notificationService;

    private User user;
    private UUID userId;
    private NotificationPreference preference;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder().id(userId).username("trader1").email("trader1@stock.com").build();
        preference = NotificationPreference.builder()
                .user(user)
                .emailEnabled(true)
                .inAppEnabled(true)
                .pushEnabled(true)
                .tradingAlerts(true)
                .aiAlerts(true)
                .newsAlerts(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully process and dispatch valid notification")
    void testSendNotificationSuccess() {
        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(userId)
                .category(NotificationCategory.TRADING)
                .title("Order Executed")
                .message("Buy order for AAPL executed")
                .build();

        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .user(user)
                .category(NotificationCategory.TRADING)
                .title("Order Executed")
                .message("Buy order for AAPL executed")
                .createdAt(Instant.now())
                .build();

        NotificationResponse responseDto = NotificationResponse.builder()
                .id(notification.getId())
                .userId(userId)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(rateLimiterService.isRateLimited(userId)).thenReturn(false);
        when(deduplicationService.isDuplicate(eq(userId), any(), any(), any(), any(Duration.class))).thenReturn(false);
        when(preferenceService.getOrCreatePreference(userId)).thenReturn(preference);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toResponse(notification)).thenReturn(responseDto);

        NotificationResponse result = notificationService.sendNotification(request);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Order Executed");

        verify(channelDispatcher, times(4)).dispatch(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should suppress notification when duplicate is detected")
    void testSendNotificationDuplicateSuppressed() {
        SendNotificationRequest request = SendNotificationRequest.builder()
                .userId(userId)
                .category(NotificationCategory.TRADING)
                .title("Order Executed")
                .message("Buy order for AAPL executed")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(rateLimiterService.isRateLimited(userId)).thenReturn(false);
        when(deduplicationService.isDuplicate(eq(userId), any(), any(), any(), any(Duration.class))).thenReturn(true);

        NotificationResponse result = notificationService.sendNotification(request);

        assertThat(result).isNull();
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return unread count correctly")
    void testGetUnreadCount() {
        when(notificationRepository.countByUserIdAndReadFalseAndArchivedFalse(userId)).thenReturn(5L);

        UnreadCountResponse result = notificationService.getUnreadCount(userId);

        assertThat(result.getUnreadCount()).isEqualTo(5L);
    }

    @Test
    @DisplayName("Should mark single notification as read")
    void testMarkAsRead() {
        UUID notificationId = UUID.randomUUID();
        Notification notification = Notification.builder()
                .id(notificationId)
                .user(user)
                .read(false)
                .build();

        NotificationResponse responseDto = NotificationResponse.builder()
                .id(notificationId)
                .read(true)
                .build();

        when(notificationRepository.findByIdAndUserId(notificationId, userId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);
        when(notificationMapper.toResponse(notification)).thenReturn(responseDto);

        NotificationResponse result = notificationService.markAsRead(userId, notificationId);

        assertThat(result.isRead()).isTrue();
    }
}
