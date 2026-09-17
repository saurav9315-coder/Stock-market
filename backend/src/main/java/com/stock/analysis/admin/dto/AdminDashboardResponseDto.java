package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponseDto {

    private UserMetrics userMetrics;
    private TradingMetrics tradingMetrics;
    private FinancialMetrics financialMetrics;
    private MarketMetrics marketMetrics;
    private Instant generatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMetrics {
        private long totalUsers;
        private long activeUsers24h;
        private long verifiedUsers;
        private long onlineUsers;
        private long dailyRegistrations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TradingMetrics {
        private long dailyTradesCount;
        private BigDecimal dailyTradeVolumeUsd;
        private long openOrdersCount;
        private long filledOrdersToday;
        private long cancelledOrdersToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialMetrics {
        private BigDecimal dailyDepositsUsd;
        private long dailyDepositsCount;
        private BigDecimal dailyWithdrawalsUsd;
        private long dailyWithdrawalsCount;
        private BigDecimal totalPlatformRevenueUsd;
        private BigDecimal totalPortfolioValueUsd;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketMetrics {
        private long activeTickersCount;
        private String marketStatus; // OPEN, CLOSED, PRE_MARKET
        private Map<String, BigDecimal> topGainers;
        private Map<String, BigDecimal> topLosers;
    }
}
