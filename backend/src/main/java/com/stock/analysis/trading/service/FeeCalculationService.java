package com.stock.analysis.trading.service;

import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.users.User;

import java.math.BigDecimal;

public interface FeeCalculationService {

    FeeBreakdown calculateFees(OrderSide side, TradingMode mode, BigDecimal quantity, BigDecimal price, User user);
}
