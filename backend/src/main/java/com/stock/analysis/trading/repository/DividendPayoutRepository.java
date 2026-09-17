package com.stock.analysis.trading.repository;

import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.entity.DividendPayout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DividendPayoutRepository extends JpaRepository<DividendPayout, UUID> {

    List<DividendPayout> findByDividendId(UUID dividendId);

    Page<DividendPayout> findByUserIdAndTradingMode(UUID userId, TradingMode tradingMode, Pageable pageable);
}
