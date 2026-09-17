package com.stock.analysis.notification.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.notification.dto.NotificationRuleRequest;
import com.stock.analysis.notification.dto.NotificationRuleResponse;
import com.stock.analysis.notification.service.NotificationRuleEngineService;
import com.stock.analysis.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/notifications/rules")
@RequiredArgsConstructor
public class NotificationRuleController {

    private final NotificationRuleEngineService ruleEngineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationRuleResponse>>> getUserRules(
            @AuthenticationPrincipal User user) {
        List<NotificationRuleResponse> rules = ruleEngineService.getUserRules(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Fetched notification rules", rules));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationRuleResponse>> createRule(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NotificationRuleRequest request) {
        NotificationRuleResponse created = ruleEngineService.createRule(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Notification rule created successfully", created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        ruleEngineService.deleteRule(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification rule deleted successfully", "DELETED"));
    }
}
