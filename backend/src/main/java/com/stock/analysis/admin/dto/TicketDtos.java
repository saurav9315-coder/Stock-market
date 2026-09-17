package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class TicketDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketSummaryDto {
        private UUID id;
        private UUID userId;
        private String username;
        private String email;
        private String subject;
        private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
        private String priority; // LOW, MEDIUM, HIGH
        private String assignedToUsername;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketDetailDto {
        private UUID id;
        private UUID userId;
        private String username;
        private String email;
        private String subject;
        private String status;
        private String priority;
        private String assignedToUsername;
        private List<TicketMessageDto> messages;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketMessageDto {
        private UUID id;
        private String senderUsername;
        private boolean isStaff;
        private String message;
        private Instant sentAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTicketRequest {
        private String subject;
        private String message;
        private String priority;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReplyTicketRequest {
        private String message;
        private boolean isInternalNote;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignTicketRequest {
        private UUID adminUserId;
    }
}
