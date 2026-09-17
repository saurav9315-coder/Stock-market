package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class TradingRiskDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderMonitoringDto {
        private UUID orderId;
        private UUID userId;
        private String username;
        private String symbol;
        private String side; // BUY, SELL
        private String orderType; // MARKET, LIMIT
        private BigDecimal quantity;
        private BigDecimal price;
        private BigDecimal filledQuantity;
        private String status; // PENDING, FILLED, CANCELLED, REJECTED
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LargeTradeAlertDto {
        private UUID tradeId;
        private UUID userId;
        private String username;
        private String symbol;
        private BigDecimal quantity;
        private BigDecimal price;
        private BigDecimal totalValueUsd;
        private Instant executedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuspiciousActivityAlertDto {
        private String alertType; // HIGH_VELOCITY_TRADING, RAPID_CANCELLATIONS, FAILED_LOGIN_SPIKE
        private UUID userId;
        private String username;
        private String description;
        private String severity; // HIGH, CRITICAL
        private Instant detectedAt;
    }
}
