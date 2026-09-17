package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.TradingRiskDtos.*;
import com.stock.analysis.admin.service.AdminTradingRiskService;
import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/trading")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminTradingRiskController {

    private final AdminTradingRiskService tradingRiskService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderMonitoringDto>>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderMonitoringDto> result = tradingRiskService.getOrders(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/large-trades")
    public ResponseEntity<ApiResponse<List<LargeTradeAlertDto>>> getLargeTrades(
            @RequestParam(defaultValue = "50000.00") BigDecimal threshold) {
        return ResponseEntity.ok(ApiResponse.success(tradingRiskService.getLargeTradeAlerts(threshold)));
    }

    @GetMapping("/suspicious-activity")
    public ResponseEntity<ApiResponse<List<SuspiciousActivityAlertDto>>> getSuspiciousActivity() {
        return ResponseEntity.ok(ApiResponse.success(tradingRiskService.getSuspiciousActivityAlerts()));
    }

    @PostMapping("/orders/{id}/cancel")
    @AdminAudited(action = "CANCEL_ORDER", resourceName = "ORDER")
    public ResponseEntity<ApiResponse<String>> cancelOrder(@PathVariable UUID id) {
        tradingRiskService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled by admin", "OK"));
    }
}
