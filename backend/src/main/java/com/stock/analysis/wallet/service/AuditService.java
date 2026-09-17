package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;

import java.util.UUID;

public interface AuditService {
    void logAction(User user, String action, String entityType, UUID entityId, String details, String ipAddress);
}
