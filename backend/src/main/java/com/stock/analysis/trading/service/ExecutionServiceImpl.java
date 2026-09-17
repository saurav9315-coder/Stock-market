package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.trading.entity.OrderAuditLog;
import com.stock.analysis.trading.entity.TradeExecution;
import com.stock.analysis.trading.event.TradingEventPublisher;
import com.stock.analysis.trading.repository.OrderAuditLogRepository;
import com.stock.analysis.trading.repository.OrderRepository;
import com.stock.analysis.trading.strategy.OrderExecutionStrategy;
import com.stock.analysis.trading.strategy.OrderStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class ExecutionServiceImpl implements ExecutionService {

    private final OrderRepository orderRepository;
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final OrderStrategyFactory orderStrategyFactory;
    private final FeeCalculationService feeCalculationService;
    private final SettlementService settlementService;
    private final TradingEventPublisher eventPublisher;

    @Override
    @Transactional
    public TradeExecution executeOrder(Order order, BigDecimal currentMarketPrice) {
        log.info("Executing orderId={}, type={}, side={}, marketPrice={}",
                order.getId(), order.getOrderType(), order.getSide(), currentMarketPrice);

        OrderExecutionStrategy strategy = orderStrategyFactory.getStrategy(order.getOrderType());
        if (!strategy.isEligibleForExecution(order, currentMarketPrice)) {
            log.info("Order id={} is not eligible for execution at current price={}", order.getId(), currentMarketPrice);
            return null;
        }

        BigDecimal fillPrice = strategy.calculateExecutionPrice(order, currentMarketPrice);
        BigDecimal remainingQty = order.getQuantity().subtract(order.getFilledQuantity());

        FeeBreakdown feeBreakdown = feeCalculationService.calculateFees(
                order.getSide(), order.getTradingMode(), remainingQty, fillPrice, order.getUser());

        // Update Order State
        OrderStatus prevStatus = order.getStatus();
        order.setFilledQuantity(order.getQuantity());
        order.setAvgFillPrice(fillPrice);
        order.setTotalFee(feeBreakdown.getTotalFee());
        order.setTotalAmount(remainingQty.multiply(fillPrice));
        order.setStatus(OrderStatus.FILLED);
        order.setFilledAt(Instant.now());

        Order savedOrder = orderRepository.save(order);

        // Audit log entry
        OrderAuditLog auditLog = OrderAuditLog.builder()
                .order(savedOrder)
                .previousStatus(prevStatus)
                .newStatus(OrderStatus.FILLED)
                .reason("Order filled at price " + fillPrice)
                .actionBy("ENGINE")
                .createdBy("ENGINE")
                .build();
        orderAuditLogRepository.save(auditLog);

        // Settle Trade
        TradeExecution execution = settlementService.settleTrade(savedOrder, remainingQty, fillPrice, feeBreakdown);

        eventPublisher.publishOrderExecuted(savedOrder, execution);
        return execution;
    }

    @Override
    @Transactional
    public List<TradeExecution> processPendingOrdersForStock(UUID stockId, BigDecimal currentMarketPrice, TradingMode tradingMode) {
        List<Order> pendingOrders = orderRepository.findByStockIdAndStatusIn(stockId, List.of(OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED));
        List<TradeExecution> executions = new ArrayList<>();

        for (Order order : pendingOrders) {
            if (order.getTradingMode() == tradingMode) {
                try {
                    TradeExecution execution = executeOrder(order, currentMarketPrice);
                    if (execution != null) {
                        executions.add(execution);
                    }
                } catch (Exception e) {
                    log.error("Error executing order id={}: {}", order.getId(), e.getMessage(), e);
                }
            }
        }
        return executions;
    }
}
