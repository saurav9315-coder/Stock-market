package com.stock.analysis.trading.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.common.PageResponse;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.trading.dto.OrderCreateRequest;
import com.stock.analysis.trading.dto.OrderResponse;
import com.stock.analysis.trading.service.FeeCalculationService;
import com.stock.analysis.trading.service.OrderService;
import com.stock.analysis.trading.service.TradingService;
import com.stock.analysis.users.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "Endpoints for placing, querying, and cancelling stock market orders")
public class OrderController {

    private final TradingService tradingService;
    private final OrderService orderService;
    private final FeeCalculationService feeCalculationService;

    @PostMapping("/buy")
    @Operation(summary = "Place Buy Order", description = "Submits a buy order (Market, Limit, Stop Loss, Stop Limit, Take Profit)")
    public ResponseEntity<ApiResponse<OrderResponse>> placeBuyOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderCreateRequest request) {
        request.setSide(OrderSide.BUY);
        OrderResponse response = tradingService.placeOrder(user, request);
        return ResponseEntity.ok(ApiResponse.success("Buy order submitted successfully", response));
    }

    @PostMapping("/sell")
    @Operation(summary = "Place Sell Order", description = "Submits a sell order (Market, Limit, Stop Loss, Stop Limit, Take Profit)")
    public ResponseEntity<ApiResponse<OrderResponse>> placeSellOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderCreateRequest request) {
        request.setSide(OrderSide.SELL);
        OrderResponse response = tradingService.placeOrder(user, request);
        return ResponseEntity.ok(ApiResponse.success("Sell order submitted successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get User Orders", description = "Retrieves paginated list of user orders with optional mode & status filtering")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getUserOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "mode", defaultValue = "DEMO") TradingMode mode,
            @RequestParam(name = "status", required = false) OrderStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> ordersPage = orderService.getUserOrders(user, mode, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(ordersPage)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Order Details", description = "Retrieves specific order details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable("id") UUID id) {
        OrderResponse response = orderService.getOrderById(user, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel Order", description = "Cancels a pending or partially filled order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal User user,
            @PathVariable("id") UUID id) {
        OrderResponse response = orderService.cancelOrder(user, id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    @PostMapping("/estimate-fee")
    @Operation(summary = "Estimate Fees", description = "Calculates estimated brokerage, platform, tax, and GST fees")
    public ResponseEntity<ApiResponse<FeeBreakdown>> estimateFee(
            @AuthenticationPrincipal User user,
            @RequestParam OrderSide side,
            @RequestParam TradingMode mode,
            @RequestParam BigDecimal quantity,
            @RequestParam BigDecimal price) {
        FeeBreakdown breakdown = feeCalculationService.calculateFees(side, mode, quantity, price, user);
        return ResponseEntity.ok(ApiResponse.success(breakdown));
    }
}
