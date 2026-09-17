package com.stock.analysis.websocket.service;

import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Getter
@Service
public class WebSocketMetricsService {

    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicLong totalInboundMessages = new AtomicLong(0);
    private final AtomicLong totalOutboundMessages = new AtomicLong(0);
    private final AtomicLong failedDeliveries = new AtomicLong(0);
    private final AtomicLong connectionErrors = new AtomicLong(0);

    public void incrementConnections() {
        activeConnections.incrementAndGet();
    }

    public void decrementConnections() {
        activeConnections.updateAndGet(curr -> Math.max(0, curr - 1));
    }

    public void recordInboundMessage() {
        totalInboundMessages.incrementAndGet();
    }

    public void recordOutboundMessage() {
        totalOutboundMessages.incrementAndGet();
    }

    public void recordFailedDelivery() {
        failedDeliveries.incrementAndGet();
    }

    public void recordConnectionError() {
        connectionErrors.incrementAndGet();
    }

    public Map<String, Object> getMetricsSummary() {
        return Map.of(
                "activeConnections", activeConnections.get(),
                "totalInboundMessages", totalInboundMessages.get(),
                "totalOutboundMessages", totalOutboundMessages.get(),
                "failedDeliveries", failedDeliveries.get(),
                "connectionErrors", connectionErrors.get()
        );
    }
}
