package com.stock.analysis.wallet.dto;

import com.stock.analysis.wallet.domain.DepositStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepositResponse {
    private UUID id;
    private UUID walletId;
    private BigDecimal amount;
    private String currency;
    private String transactionReference;
    private DepositStatus status;
    private PaymentProofResponse paymentProof;
    private String rejectionReason;
    private String adminNotes;
    private Instant createdAt;
}
