package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.domain.AuditLog;
import com.stock.analysis.wallet.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Override
    public void logAction(User user, String action, String entityType, UUID entityId, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .createdBy(user != null ? user.getUsername() : "SYSTEM")
                    .build();
            auditLogRepository.save(auditLog);
            log.info("Audit Log Created: Action={}, EntityType={}, EntityId={}, User={}", 
                    action, entityType, entityId, user != null ? user.getUsername() : "SYSTEM");
        } catch (Exception e) {
            log.error("Failed to save audit log for action: {}", action, e);
        }
    }
}
