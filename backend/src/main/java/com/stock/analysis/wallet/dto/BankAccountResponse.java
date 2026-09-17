package com.stock.analysis.wallet.dto;

import com.stock.analysis.wallet.domain.BankAccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountResponse {
    private UUID id;
    private String bankName;
    private String maskedAccountNumber;
    private String accountHolderName;
    private String ifscOrSwift;
    private String routingNumber;
    private String country;
    private String currency;
    private BankAccountStatus verificationStatus;
}
