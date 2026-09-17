package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.RolePermissionDtos.*;
import com.stock.analysis.admin.service.AdminRbacService;
import com.stock.analysis.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminRbacController {

    private final AdminRbacService rbacService;

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success(rbacService.getAllRoles()));
    }

    @PostMapping("/roles")
    @AdminAudited(action = "CREATE_ROLE", resourceName = "ROLE")
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@RequestBody RoleCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(rbacService.createRole(request)));
    }

    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.success(rbacService.getAllPermissions()));
    }

    @PostMapping("/users/roles/assign")
    @AdminAudited(action = "ASSIGN_ROLES", resourceName = "USER_ROLE")
    public ResponseEntity<ApiResponse<String>> assignRoles(@RequestBody AssignRoleRequest request) {
        rbacService.assignRolesToUser(request);
        return ResponseEntity.ok(ApiResponse.success("Roles assigned successfully", "OK"));
    }

    @DeleteMapping("/users/{userId}/roles/{roleName}")
    @AdminAudited(action = "REMOVE_ROLE", resourceName = "USER_ROLE")
    public ResponseEntity<ApiResponse<String>> removeRole(@PathVariable UUID userId, @PathVariable String roleName) {
        rbacService.removeRoleFromUser(userId, roleName);
        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", "OK"));
    }
}
