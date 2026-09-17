package com.stock.analysis.notification.repository;

import com.stock.analysis.notification.domain.NotificationAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationAuditLogRepository extends JpaRepository<NotificationAuditLog, UUID> {

    List<NotificationAuditLog> findByUserIdOrderByDispatchedAtDesc(UUID userId);

    List<NotificationAuditLog> findByNotificationId(UUID notificationId);
}
