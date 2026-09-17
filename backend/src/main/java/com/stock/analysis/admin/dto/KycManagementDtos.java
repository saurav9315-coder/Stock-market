package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class KycManagementDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycSummaryDto {
        private UUID id;
        private UUID userId;
        private String username;
        private String email;
        private String kycLevel;
        private String status; // PENDING, APPROVED, REJECTED, ACTION_REQUIRED
        private Instant submittedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycDetailDto {
        private UUID id;
        private UUID userId;
        private String username;
        private String email;
        private String fullName;
        private String dateOfBirth;
        private String nationality;
        private String idType;
        private String idNumber;
        private String documentFrontUrl;
        private String documentBackUrl;
        private String selfieUrl;
        private String addressProofUrl;
        private String status;
        private String rejectionReason;
        private Instant submittedAt;
        private List<KycHistoryDto> history;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycHistoryDto {
        private UUID id;
        private String status;
        private String reviewerUsername;
        private String remarks;
        private Instant reviewedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycActionRequest {
        private String action; // APPROVE, REJECT, REQUEST_DOCUMENTS
        private String reason;
        private String notes;
    }
}
