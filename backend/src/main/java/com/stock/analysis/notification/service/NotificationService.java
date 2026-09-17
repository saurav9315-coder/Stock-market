package com.stock.analysis.notification.service;

import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.notification.channel.NotificationChannelDispatcher;
import com.stock.analysis.notification.domain.*;
import com.stock.analysis.notification.dto.*;
import com.stock.analysis.notification.mapper.NotificationMapper;
import com.stock.analysis.notification.repository.NotificationRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
// import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationPreferenceService preferenceService;
    private final NotificationDeduplicationService deduplicationService;
    private final NotificationRateLimiterService rateLimiterService;
    private final NotificationChannelDispatcher channelDispatcher;
    private final NotificationMapper notificationMapper;

    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        User recipient = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // 1. Rate Limiting Check
        if (rateLimiterService.isRateLimited(recipient.getId())) {
            log.warn("Notification dropped due to hourly rate limit for user {}", recipient.getId());
            return null;
        }

        // 2. Deduplication Check (30-second window)
        if (deduplicationService.isDuplicate(recipient.getId(), request.getCategory().name(), request.getTitle(), request.getMessage(), Duration.ofSeconds(30))) {
            log.warn("Duplicate notification suppressed for user {}", recipient.getId());
            return null;
        }

        // 3. User Preferences Check
        NotificationPreference preferences = preferenceService.getOrCreatePreference(recipient.getId());
        if (!isCategoryEnabled(preferences, request.getCategory())) {
            log.info("Notification category {} disabled by user preferences for user {}", request.getCategory(), recipient.getId());
            return null;
        }

        // 4. Construct Notification Entity
        Notification notification = Notification.builder()
                .user(recipient)
                .category(request.getCategory())
                .channel(request.getChannel() != null ? request.getChannel() : NotificationChannel.IN_APP)
                .priority(request.getPriority())
                .severity(request.getSeverity())
                .title(request.getTitle())
                .message(request.getMessage())
                .referenceUrl(request.getReferenceUrl())
                .metadataJson(request.getMetadataJson())
                .read(false)
                .archived(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // 5. Dispatch across enabled channels asynchronously
        dispatchToEnabledChannels(preferences, saved, recipient, request.getTemplateModel());

        return notificationMapper.toResponse(saved);
    }

    private void dispatchToEnabledChannels(NotificationPreference preferences, Notification notification, User recipient, Map<String, Object> templateModel) {
        // In-App
        if (preferences.isInAppEnabled()) {
            channelDispatcher.dispatch(NotificationChannel.IN_APP, notification, recipient, templateModel);
        }
        // Real-Time WebSocket
        channelDispatcher.dispatch(NotificationChannel.WEBSOCKET, notification, recipient, templateModel);

        // Email
        if (preferences.isEmailEnabled()) {
            channelDispatcher.dispatch(NotificationChannel.EMAIL, notification, recipient, templateModel);
        }
        // Push
        if (preferences.isPushEnabled()) {
            channelDispatcher.dispatch(NotificationChannel.PUSH, notification, recipient, templateModel);
        }
        // SMS
        if (preferences.isSmsEnabled()) {
            channelDispatcher.dispatch(NotificationChannel.SMS, notification, recipient, templateModel);
        }
        // WhatsApp
        if (preferences.isWhatsappEnabled()) {
            channelDispatcher.dispatch(NotificationChannel.WHATSAPP, notification, recipient, templateModel);
        }
    }

    private boolean isCategoryEnabled(NotificationPreference pref, NotificationCategory category) {
        return switch (category) {
            case AUTHENTICATION, ADMIN -> true;
            case WALLET, TRADING -> pref.isTradingAlerts();
            case PORTFOLIO, AI -> pref.isAiAlerts();
            case MARKET -> pref.isNewsAlerts();
        };
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(UUID userId, NotificationFilterRequest filter) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());

        Page<Notification> page;
        if (Boolean.TRUE.equals(filter.getUnreadOnly())) {
            page = notificationRepository.findByUserIdAndReadFalseAndArchivedFalseOrderByCreatedAtDesc(userId, pageable);
        } else if (filter.getCategory() != null) {
            page = notificationRepository.findByUserIdAndCategoryAndArchivedFalseOrderByCreatedAtDesc(userId, filter.getCategory(), pageable);
        } else {
            page = notificationRepository.findByUserIdAndArchivedFalseOrderByCreatedAtDesc(userId, pageable);
        }

        return page.map(notificationMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(UUID userId) {
        long unread = notificationRepository.countByUserIdAndReadFalseAndArchivedFalse(userId);
        return UnreadCountResponse.builder()
                .userId(userId)
                .unreadCount(unread)
                .build();
    }

    @Transactional
    public NotificationResponse markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        }
        return notificationMapper.toResponse(notification);
    }

    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllAsReadForUser(userId, Instant.now());
    }

    @Transactional
    public void archiveNotification(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setArchived(true);
        notification.setArchivedAt(Instant.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setDeletedAt(Instant.now());
        notificationRepository.save(notification);
    }
}
