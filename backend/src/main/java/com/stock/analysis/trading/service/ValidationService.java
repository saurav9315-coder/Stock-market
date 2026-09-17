package com.stock.analysis.trading.service;

import com.stock.analysis.market.Stock;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.dto.OrderCreateRequest;
import com.stock.analysis.users.User;

import java.math.BigDecimal;

public interface ValidationService {

    void validateOrderRequest(User user, OrderCreateRequest request, Stock stock, Portfolio portfolio);

    void validateMarketHours(Stock stock);

    void validateSufficientBalance(User user, com.stock.analysis.trading.domain.TradingMode mode, BigDecimal requiredAmount);

    void validateSufficientHoldings(Portfolio portfolio, Stock stock, BigDecimal sellQuantity);

    void validateIdempotency(String clientOrderId);

    void validateTradingLimits(User user, BigDecimal orderValue);
}
