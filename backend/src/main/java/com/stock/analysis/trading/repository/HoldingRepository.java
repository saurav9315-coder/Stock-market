package com.stock.analysis.trading.repository;

import com.stock.analysis.portfolio.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, UUID> {

    Optional<Holding> findByPortfolioIdAndStockId(UUID portfolioId, UUID stockId);

    List<Holding> findByPortfolioId(UUID portfolioId);

    List<Holding> findByStockId(UUID stockId);
}
