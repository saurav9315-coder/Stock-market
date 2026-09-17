package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDto {
    private String reportType; // USERS, TRADING, REVENUE, WALLET, KYC, AI
    private String format; // CSV, EXCEL, PDF
    private Instant startDate;
    private Instant endDate;
}
