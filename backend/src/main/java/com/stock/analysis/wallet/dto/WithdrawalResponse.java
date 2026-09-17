package com.stock.analysis.wallet.dto;

import com.stock.analysis.wallet.domain.WithdrawalStatus;
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
public class WithdrawalResponse {
    private UUID id;
    private UUID walletId;
    private BigDecimal amount;
    private String currency;
    private WithdrawalStatus status;
    private UUID bankAccountId;
    private String rejectionReason;
    private String adminNotes;
    private Instant createdAt;
}
