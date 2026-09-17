package com.stock.analysis.trading.service;

import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.PortfolioSummaryResponse;
import com.stock.analysis.users.User;

public interface PortfolioService {

    Portfolio getOrCreatePortfolio(User user, TradingMode mode);

    PortfolioSummaryResponse getPortfolioSummary(User user, TradingMode mode);
}
