package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.RolePermissionDtos.*;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.users.PermissionEntity;
import com.stock.analysis.users.PermissionRepository;
import com.stock.analysis.users.RoleEntity;
import com.stock.analysis.users.RoleRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRbacService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toRoleDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(p -> PermissionDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .category(getCategoryFromPermission(p.getName()))
                        .description("Permission to perform " + p.getName())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public RoleDto createRole(RoleCreateRequest request) {
        Set<PermissionEntity> permissions = new HashSet<>();
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            permissions.addAll(permissionRepository.findAllById(request.getPermissionIds()));
        }

        RoleEntity role = RoleEntity.builder()
                .name(request.getName().startsWith("ROLE_") ? request.getName() : "ROLE_" + request.getName())
                .permissions(permissions)
                .build();

        RoleEntity saved = roleRepository.save(role);
        log.info("Created new role: {}", saved.getName());
        return toRoleDto(saved);
    }

    @Transactional
    public void assignRolesToUser(AssignRoleRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        Set<RoleEntity> roles = new HashSet<>();
        for (String roleName : request.getRoleNames()) {
            RoleEntity role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
            roles.add(role);
        }

        user.setRolesSet(roles);
        userRepository.save(user);
        log.info("Assigned roles {} to user {}", request.getRoleNames(), request.getUserId());
    }

    @Transactional
    public void removeRoleFromUser(UUID userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.getRolesSet().removeIf(r -> r.getName().equalsIgnoreCase(roleName));
        userRepository.save(user);
        log.info("Removed role {} from user {}", roleName, userId);
    }

    private RoleDto toRoleDto(RoleEntity role) {
        Set<PermissionDto> permDtos = role.getPermissions() != null
                ? role.getPermissions().stream()
                .map(p -> PermissionDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .category(getCategoryFromPermission(p.getName()))
                        .description("Permission to perform " + p.getName())
                        .build())
                .collect(Collectors.toSet())
                : Set.of();

        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description("Role " + role.getName())
                .permissions(permDtos)
                .build();
    }

    private String getCategoryFromPermission(String name) {
        if (name == null) return "GENERAL";
        if (name.contains("USER")) return "USER_MANAGEMENT";
        if (name.contains("TRADE") || name.contains("ORDER")) return "TRADING";
        if (name.contains("WALLET") || name.contains("FINANCE")) return "FINANCE";
        if (name.contains("ADMIN")) return "ADMINISTRATION";
        return "GENERAL";
    }
}
