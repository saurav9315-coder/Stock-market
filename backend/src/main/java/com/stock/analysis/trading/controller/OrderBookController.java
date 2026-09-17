package com.stock.analysis.trading.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.trading.dto.OrderBookResponse;
import com.stock.analysis.trading.service.OrderBookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market/order-book")
@RequiredArgsConstructor
@Tag(name = "Market Order Book", description = "Endpoints for retrieving active order book market depth (L2 bids & asks)")
public class OrderBookController {

    private final OrderBookService orderBookService;

    @GetMapping("/{symbol}")
    @Operation(summary = "Get Market Depth", description = "Retrieves top L2 bids and asks for a given stock symbol")
    public ResponseEntity<ApiResponse<OrderBookResponse>> getOrderBookDepth(@PathVariable("symbol") String symbol) {
        OrderBookResponse marketDepth = orderBookService.getMarketDepth(symbol.toUpperCase());
        return ResponseEntity.ok(ApiResponse.success(marketDepth));
    }
}
