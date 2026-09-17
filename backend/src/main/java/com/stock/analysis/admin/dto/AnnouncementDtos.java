package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class AnnouncementDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnouncementDto {
        private UUID id;
        private String title;
        private String content;
        private String type; // ANNOUNCEMENT, MAINTENANCE, EMERGENCY, MARKETING
        private String targetAudience;
        private Instant scheduledAt;
        private Instant broadcastAt;
        private String status; // DRAFT, SCHEDULED, BROADCASTED, CANCELLED
        private String broadcastChannel;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAnnouncementRequest {
        private String title;
        private String content;
        private String type;
        private String targetAudience;
        private Instant scheduledAt;
        private String broadcastChannel;
    }
}
