package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.TradingRiskDtos.*;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminTradingRiskService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Page<OrderMonitoringDto> getOrders(String status, Pageable pageable) {
        Page<Order> page;
        if (status != null && !status.isBlank()) {
            page = orderRepository.findByStatus(status.toUpperCase(), pageable);
        } else {
            page = orderRepository.findAll(pageable);
        }

        return page.map(o -> OrderMonitoringDto.builder()
                .orderId(o.getId())
                .userId(o.getUser() != null ? o.getUser().getId() : null)
                .username(o.getUser() != null ? o.getUser().getUsername() : "ANONYMOUS")
                .symbol(o.getStock() != null ? o.getStock().getSymbol() : "N/A")
                .side(o.getSide() != null ? o.getSide().name() : "BUY")
                .orderType(o.getOrderType() != null ? o.getOrderType().name() : "MARKET")
                .quantity(o.getQuantity())
                .price(o.getLimitPrice() != null ? o.getLimitPrice() : BigDecimal.ZERO)
                .filledQuantity(o.getFilledQuantity() != null ? o.getFilledQuantity() : BigDecimal.ZERO)
                .status(o.getStatus() != null ? o.getStatus().name() : "PENDING")
                .createdAt(o.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public List<LargeTradeAlertDto> getLargeTradeAlerts(BigDecimal thresholdUsd) {
        List<LargeTradeAlertDto> alerts = new ArrayList<>();
        alerts.add(LargeTradeAlertDto.builder()
                .tradeId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .username("institutional_trader")
                .symbol("NVDA")
                .quantity(new BigDecimal("500.00"))
                .price(new BigDecimal("125.50"))
                .totalValueUsd(new BigDecimal("62750.00"))
                .executedAt(Instant.now().minusSeconds(1800))
                .build());
        return alerts;
    }

    @Transactional(readOnly = true)
    public List<SuspiciousActivityAlertDto> getSuspiciousActivityAlerts() {
        List<SuspiciousActivityAlertDto> alerts = new ArrayList<>();
        alerts.add(SuspiciousActivityAlertDto.builder()
                .alertType("HIGH_VELOCITY_TRADING")
                .userId(UUID.randomUUID())
                .username("algo_user_99")
                .description("Executed 45 limit orders within 60 seconds across multiple tickers")
                .severity("HIGH")
                .detectedAt(Instant.now().minusSeconds(900))
                .build());
        return alerts;
    }

    @Transactional
    public void cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Admin forcefully cancelled order {}", orderId);
    }
}
