package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsSummaryResponse {
    private String headline;
    private String executiveSummary;
    private List<String> keyTakeaways;
    private String sentiment; // BULLISH, BEARISH, NEUTRAL
    private double sentimentScore; // -1.0 to 1.0
    private String impactAssessment; // HIGH, MEDIUM, LOW
    private List<String> relatedStockTickers;
    private String disclaimer;
}
