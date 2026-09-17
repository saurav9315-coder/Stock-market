package com.stock.analysis.trading.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.PortfolioSummaryResponse;
import com.stock.analysis.trading.service.PortfolioService;
import com.stock.analysis.users.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio Management", description = "Endpoints for user portfolio metrics, holdings, PnL, and returns")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    @Operation(summary = "Get Portfolio Summary", description = "Retrieves user portfolio summary, cash balance, holdings, and return metrics for DEMO or LIVE mode")
    public ResponseEntity<ApiResponse<PortfolioSummaryResponse>> getPortfolio(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "mode", defaultValue = "DEMO") TradingMode mode) {
        PortfolioSummaryResponse summary = portfolioService.getPortfolioSummary(user, mode);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
