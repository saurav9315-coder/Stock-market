package com.stock.analysis.wallet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProofResponse {
    private UUID id;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String originalFilename;
}
