package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

public class AiOperationsDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiUsageStatsDto {
        private long totalRequestsToday;
        private long totalTokensConsumedToday;
        private BigDecimal estimatedCostTodayUsd;
        private long activeUsersToday;
        private double averageLatencyMs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromptTemplateDto {
        private String templateKey;
        private String name;
        private String category;
        private String systemPrompt;
        private String userPromptTemplate;
        private boolean active;
        private int version;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromptTemplateRequest {
        private String templateKey;
        private String name;
        private String category;
        private String systemPrompt;
        private String userPromptTemplate;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiProviderHealthDto {
        private String providerName; // Gemini API
        private String status; // UP, DEGRADED, DOWN
        private long responseTimeMs;
        private double errorRatePercent;
        private Instant lastCheckedAt;
    }
}
