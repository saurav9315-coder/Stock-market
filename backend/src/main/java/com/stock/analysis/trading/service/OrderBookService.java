package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Order;
import com.stock.analysis.trading.dto.OrderBookResponse;

public interface OrderBookService {

    void addOrder(Order order);

    void removeOrder(Order order);

    OrderBookResponse getMarketDepth(String symbol);
}
