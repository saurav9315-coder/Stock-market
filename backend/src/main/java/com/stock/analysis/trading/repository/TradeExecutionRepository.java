package com.stock.analysis.trading.repository;

import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.entity.TradeExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TradeExecutionRepository extends JpaRepository<TradeExecution, UUID> {

    Page<TradeExecution> findByUserIdAndTradingMode(UUID userId, TradingMode tradingMode, Pageable pageable);

    List<TradeExecution> findByBuyOrderIdOrSellOrderId(UUID buyOrderId, UUID sellOrderId);

    Page<TradeExecution> findByPortfolioId(UUID portfolioId, Pageable pageable);
}
