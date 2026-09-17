package com.stock.analysis.trading.service;

import com.stock.analysis.trading.domain.OrderStatus;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.OrderResponse;
import com.stock.analysis.users.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrderService {

    OrderResponse getOrderById(User user, UUID id);

    Page<OrderResponse> getUserOrders(User user, TradingMode mode, OrderStatus status, Pageable pageable);

    OrderResponse cancelOrder(User user, UUID orderId);
}
