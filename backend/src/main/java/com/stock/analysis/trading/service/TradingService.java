package com.stock.analysis.trading.service;

import com.stock.analysis.trading.dto.OrderCreateRequest;
import com.stock.analysis.trading.dto.OrderResponse;
import com.stock.analysis.users.User;

public interface TradingService {

    OrderResponse placeOrder(User user, OrderCreateRequest request);
}
