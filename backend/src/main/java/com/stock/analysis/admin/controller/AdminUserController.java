package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.UserManagementDtos.*;
import com.stock.analysis.admin.service.AdminUserManagementService;
import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final AdminUserManagementService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserSummaryDto>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Page<UserSummaryDto> pageResult = userService.getUsers(search, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(pageResult)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getUserDetail(@PathVariable UUID id) {
        UserDetailDto detail = userService.getUserDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PutMapping("/{id}/status")
    @AdminAudited(action = "UPDATE_USER_STATUS", resourceName = "USER")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody UserStatusUpdateRequest request) {
        userService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", "OK"));
    }

    @PostMapping("/{id}/suspend")
    @AdminAudited(action = "SUSPEND_USER", resourceName = "USER")
    public ResponseEntity<ApiResponse<String>> suspendUser(
            @PathVariable UUID id,
            @RequestBody UserSuspendRequest request) {
        userService.suspendUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully", "OK"));
    }

    @PostMapping("/{id}/reactivate")
    @AdminAudited(action = "REACTIVATE_USER", resourceName = "USER")
    public ResponseEntity<ApiResponse<String>> reactivateUser(@PathVariable UUID id) {
        userService.reactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User reactivated successfully", "OK"));
    }

    @PostMapping("/{id}/lock")
    @AdminAudited(action = "LOCK_USER_ACCOUNT", resourceName = "USER")
    public ResponseEntity<ApiResponse<String>> lockAccount(@PathVariable UUID id) {
        userService.lockAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Account locked successfully", "OK"));
    }

    @PostMapping("/{id}/unlock")
    @AdminAudited(action = "UNLOCK_USER_ACCOUNT", resourceName = "USER")
    public ResponseEntity<ApiResponse<String>> unlockAccount(@PathVariable UUID id) {
        userService.unlockAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Account unlocked successfully", "OK"));
    }

    @PostMapping("/{id}/force-logout")
    @AdminAudited(action = "FORCE_LOGOUT_USER", resourceName = "USER")
    public ResponseEntity<ApiResponse<String>> forceLogout(@PathVariable UUID id) {
        userService.forceLogout(id);
        return ResponseEntity.ok(ApiResponse.success("User forced logout successfully", "OK"));
    }

    @PostMapping("/{id}/reset-password")
    @AdminAudited(action = "ADMIN_RESET_PASSWORD", resourceName = "USER")
    public ResponseEntity<ApiResponse<ResetPasswordResponse>> resetPassword(@PathVariable UUID id) {
        ResetPasswordResponse response = userService.resetPassword(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/login-history")
    public ResponseEntity<ApiResponse<List<UserLoginHistoryDto>>> getLoginHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getLoginHistory(id)));
    }

    @GetMapping("/{id}/devices")
    public ResponseEntity<ApiResponse<List<UserDeviceDto>>> getDevices(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getDevices(id)));
    }

    @GetMapping("/{id}/sessions")
    public ResponseEntity<ApiResponse<List<UserSessionDto>>> getSessions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getSessions(id)));
    }
}
