package com.stock.analysis.market;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LivePriceCacheRepository extends JpaRepository<LivePriceCache, UUID> {
    Optional<LivePriceCache> findByStockId(UUID stockId);
    Optional<LivePriceCache> findByStockSymbol(String symbol);
    
    @Query("SELECT lpc FROM LivePriceCache lpc ORDER BY lpc.changePercent DESC")
    List<LivePriceCache> findTopGainers();

    @Query("SELECT lpc FROM LivePriceCache lpc ORDER BY lpc.changePercent ASC")
    List<LivePriceCache> findTopLosers();
}
