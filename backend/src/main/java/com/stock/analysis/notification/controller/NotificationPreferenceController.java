package com.stock.analysis.notification.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.notification.dto.NotificationPreferenceRequest;
import com.stock.analysis.notification.dto.NotificationPreferenceResponse;
import com.stock.analysis.notification.service.NotificationPreferenceService;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/preferences/notifications")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences(
            @AuthenticationPrincipal User user) {
        NotificationPreferenceResponse response = preferenceService.getPreferences(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Fetched notification preferences", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @AuthenticationPrincipal User user,
            @RequestBody NotificationPreferenceRequest request) {
        NotificationPreferenceResponse response = preferenceService.updatePreferences(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Updated notification preferences successfully", response));
    }
}
