package com.stock.analysis.notification.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.notification.domain.NotificationCategory;
import com.stock.analysis.notification.dto.NotificationFilterRequest;
import com.stock.analysis.notification.dto.NotificationResponse;
import com.stock.analysis.notification.dto.UnreadCountResponse;
import com.stock.analysis.notification.service.NotificationService;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) NotificationCategory category,
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        NotificationFilterRequest filter = NotificationFilterRequest.builder()
                .category(category)
                .unreadOnly(unreadOnly)
                .query(query)
                .page(page)
                .size(size)
                .build();

        Page<NotificationResponse> result = notificationService.getUserNotifications(user.getId(), filter);
        return ResponseEntity.ok(ApiResponse.success("Fetched notifications successfully", result));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal User user) {
        UnreadCountResponse unread = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success(unread));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        NotificationResponse updated = notificationService.markAsRead(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(
            @AuthenticationPrincipal User user) {
        int updatedCount = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked all notifications as read", updatedCount));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<String>> archiveNotification(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        notificationService.archiveNotification(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification archived successfully", "ARCHIVED"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        notificationService.deleteNotification(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", "DELETED"));
    }
}
