package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.OrderResponse;
import com.stock.analysis.trading.entity.OrderAuditLog;
import com.stock.analysis.trading.event.TradingEventPublisher;
import com.stock.analysis.trading.mapper.OrderMapper;
import com.stock.analysis.trading.repository.OrderAuditLogRepository;
import com.stock.analysis.trading.repository.OrderRepository;
import com.stock.analysis.trading.repository.WalletBalanceRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.WalletBalance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final WalletBalanceRepository walletBalanceRepository;
    private final OrderMapper orderMapper;
    private final OrderBookService orderBookService;
    private final TradingEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(User user, UUID id) {
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found or access denied"));
        return orderMapper.toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(User user, TradingMode mode, OrderStatus status, Pageable pageable) {
        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByUserIdAndTradingModeAndStatus(user.getId(), mode, status, pageable);
        } else {
            orders = orderRepository.findByUserIdAndTradingMode(user.getId(), mode, pageable);
        }
        return orders.map(orderMapper::toDto);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(User user, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found or access denied"));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PARTIALLY_FILLED) {
            throw new IllegalStateException("Order cannot be cancelled in state: " + order.getStatus());
        }

        OrderStatus prevStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledReason("Cancelled by user request");
        order.setCancelledAt(Instant.now());

        // Release locked funds if BUY order
        if (order.getSide() == OrderSide.BUY) {
            WalletBalance walletBalance = walletBalanceRepository.findByWalletUserId(user.getId()).orElse(null);
            if (walletBalance != null) {
                BigDecimal remainingCost = order.getQuantity().subtract(order.getFilledQuantity())
                        .multiply(order.getLimitPrice() != null ? order.getLimitPrice() : order.getStopPrice() != null ? order.getStopPrice() : BigDecimal.ZERO);
                remainingCost = remainingCost.add(order.getTotalFee());

                if (order.getTradingMode() == TradingMode.DEMO) {
                    BigDecimal release = walletBalance.getDemoLockedBalance().min(remainingCost);
                    walletBalance.setDemoLockedBalance(walletBalance.getDemoLockedBalance().subtract(release).max(BigDecimal.ZERO));
                    walletBalance.setDemoAvailableBalance(walletBalance.getDemoAvailableBalance().add(release));
                } else {
                    BigDecimal release = walletBalance.getLockedBalance().min(remainingCost);
                    walletBalance.setLockedBalance(walletBalance.getLockedBalance().subtract(release).max(BigDecimal.ZERO));
                    walletBalance.setAvailableBalance(walletBalance.getAvailableBalance().add(release));
                }
                walletBalanceRepository.save(walletBalance);
            }
        }

        Order cancelledOrder = orderRepository.save(order);

        // Record Audit Log
        OrderAuditLog auditLog = OrderAuditLog.builder()
                .order(cancelledOrder)
                .previousStatus(prevStatus)
                .newStatus(OrderStatus.CANCELLED)
                .reason("User explicitly requested order cancellation")
                .actionBy(user.getUsername())
                .createdBy(user.getUsername())
                .build();
        orderAuditLogRepository.save(auditLog);

        orderBookService.removeOrder(cancelledOrder);
        eventPublisher.publishOrderCancelled(cancelledOrder, "Cancelled by user");

        return orderMapper.toDto(cancelledOrder);
    }
}
