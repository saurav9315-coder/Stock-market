package com.stock.analysis.market;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface HistoricalPriceRepository extends JpaRepository<HistoricalPrice, HistoricalPriceId> {
    List<HistoricalPrice> findByStockIdOrderByTimestampAsc(UUID stockId);
    
    @Query("SELECT hp FROM HistoricalPrice hp WHERE hp.stock.id = :stockId AND hp.timestamp >= :from AND hp.timestamp <= :to ORDER BY hp.timestamp ASC")
    List<HistoricalPrice> findByStockIdAndTimestampBetween(
            @Param("stockId") UUID stockId,
            @Param("from") Instant from,
            @Param("to") Instant to
    );
}
