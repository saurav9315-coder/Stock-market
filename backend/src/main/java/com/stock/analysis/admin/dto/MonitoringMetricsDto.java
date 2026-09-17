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
public class MonitoringMetricsDto {

    private ServiceHealth apiHealth;
    private ServiceHealth databaseHealth;
    private ServiceHealth redisHealth;
    private ServiceHealth webSocketHealth;
    private SystemMetrics serverMetrics;
    private Instant timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceHealth {
        private String serviceName;
        private String status; // UP, DEGRADED, DOWN
        private long latencyMs;
        private String details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemMetrics {
        private long jvmHeapUsedMb;
        private long jvmHeapMaxMb;
        private double systemCpuLoad;
        private int activeThreads;
        private long uptimeSeconds;
    }
}
