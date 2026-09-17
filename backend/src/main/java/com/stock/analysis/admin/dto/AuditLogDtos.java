package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class AuditLogDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminAuditLogDto {
        private UUID id;
        private String adminUsername;
        private String action;
        private String resourceName;
        private UUID resourceId;
        private String ipAddress;
        private String requestId;
        private String url;
        private String beforeState;
        private String afterState;
        private String details;
        private Instant createdAt;
    }
}
