package com.stock.analysis.websocket.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.websocket.service.WebSocketMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/realtime")
@RequiredArgsConstructor
@Tag(name = "Real-Time Telemetry & Monitoring", description = "Endpoints for monitoring active WebSocket connections, message throughput, and error metrics.")
public class RealtimeMetricsController {

    private final WebSocketMetricsService metricsService;

    @GetMapping("/metrics")
    @Operation(summary = "Get Real-Time Connection Metrics", description = "Retrieves active WebSocket connection counts, inbound/outbound message counters, and failure rates.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics() {
        return ResponseEntity.ok(ApiResponse.success(metricsService.getMetricsSummary()));
    }
}
