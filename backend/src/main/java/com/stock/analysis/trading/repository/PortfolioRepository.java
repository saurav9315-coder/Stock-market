package com.stock.analysis.trading.repository;

import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.TradingMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {

    Optional<Portfolio> findByUserIdAndTradingMode(UUID userId, TradingMode tradingMode);

    List<Portfolio> findByUserId(UUID userId);
}
