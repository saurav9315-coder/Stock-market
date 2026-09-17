package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioAnalysisResponse {
    private BigDecimal totalPortfolioValue;
    private int totalPositions;
    private Map<String, BigDecimal> assetAllocation;
    private Map<String, BigDecimal> sectorExposure;
    private int riskScore; // 1 - 100
    private String concentrationRisk;
    private String diversificationRating;
    private String performanceSummary;
    private List<String> educationalSuggestions;
    private String disclaimer;
}
