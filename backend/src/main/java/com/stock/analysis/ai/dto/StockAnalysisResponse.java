package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAnalysisResponse {
    private String symbol;
    private String companyName;
    private BigDecimal currentPrice;
    private List<String> bullishFactors;
    private List<String> bearishFactors;
    private List<String> keyObservations;
    private String educationalSummary;
    private String technicalOverview;
    private String riskFactors;
    private String disclaimer;
}
