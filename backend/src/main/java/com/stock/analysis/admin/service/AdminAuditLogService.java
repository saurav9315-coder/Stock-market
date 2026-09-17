package com.stock.analysis.admin.service;

import com.stock.analysis.admin.AdminAuditLog;
import com.stock.analysis.admin.dto.AuditLogDtos.AdminAuditLogDto;
import com.stock.analysis.admin.repository.AdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuditLogService {

    private final AdminAuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Page<AdminAuditLogDto> getAuditLogs(String action, String adminUsername, Pageable pageable) {
        Page<AdminAuditLog> page;
        if (action != null && !action.isBlank()) {
            page = auditLogRepository.findByAction(action, pageable);
        } else if (adminUsername != null && !adminUsername.isBlank()) {
            page = auditLogRepository.findByAdminUsername(adminUsername, pageable);
        } else {
            page = auditLogRepository.findAll(pageable);
        }

        return page.map(log -> AdminAuditLogDto.builder()
                .id(log.getId())
                .adminUsername(log.getAdminUsername())
                .action(log.getAction())
                .resourceName(log.getResourceName())
                .resourceId(log.getResourceId())
                .ipAddress(log.getIpAddress())
                .requestId(log.getRequestId())
                .url(log.getUrl())
                .beforeState(log.getBeforeState())
                .afterState(log.getAfterState())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build());
    }
}
