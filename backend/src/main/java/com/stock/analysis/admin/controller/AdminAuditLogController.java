package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.dto.AuditLogDtos.AdminAuditLogDto;
import com.stock.analysis.admin.service.AdminAuditLogService;
import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminAuditLogController {

    private final AdminAuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminAuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String adminUsername,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Page<AdminAuditLogDto> pageResult = auditLogService.getAuditLogs(action, adminUsername, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(pageResult)));
    }
}
