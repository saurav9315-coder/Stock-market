package com.stock.analysis.trading.repository;

import com.stock.analysis.trading.domain.DividendStatus;
import com.stock.analysis.trading.entity.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DividendRepository extends JpaRepository<Dividend, UUID> {

    List<Dividend> findByStockId(UUID stockId);

    List<Dividend> findByStatus(DividendStatus status);
}
