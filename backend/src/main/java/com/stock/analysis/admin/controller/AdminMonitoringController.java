package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.dto.MonitoringMetricsDto;
import com.stock.analysis.admin.service.AdminMonitoringService;
import com.stock.analysis.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/monitoring")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminMonitoringController {

    private final AdminMonitoringService monitoringService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<MonitoringMetricsDto>> getSystemHealth() {
        return ResponseEntity.ok(ApiResponse.success(monitoringService.getSystemHealthAndMetrics()));
    }
}
