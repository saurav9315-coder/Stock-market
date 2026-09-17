package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class FinancialOperationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepositReviewDto {
        private UUID id;
        private UUID userId;
        private String username;
        private String email;
        private BigDecimal amount;
        private String currency;
        private String paymentMethod;
        private String transactionReference;
        private String proofImageUrl;
        private String status; // PENDING, APPROVED, REJECTED
        private String notes;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepositActionRequest {
        private String action; // APPROVE, REJECT
        private String reason;
        private String internalNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WithdrawalReviewDto {
        private UUID id;
        private UUID userId;
        private String username;
        private String email;
        private BigDecimal amount;
        private BigDecimal fee;
        private BigDecimal netAmount;
        private String currency;
        private String bankName;
        private String accountNumber;
        private String accountHolderName;
        private String status; // PENDING, PROCESSING, COMPLETED, REJECTED
        private String internalNotes;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WithdrawalActionRequest {
        private String action; // APPROVE, REJECT, MARK_PROCESSING, MARK_COMPLETED
        private String reason;
        private String internalNotes;
    }
}
