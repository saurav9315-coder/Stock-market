package com.stock.analysis.market.service;

import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.market.LivePriceCache;
import com.stock.analysis.market.LivePriceCacheRepository;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.market.dto.LivePriceDto;
import com.stock.analysis.market.dto.StockDto;
import com.stock.analysis.market.mapper.LivePriceMapper;
import com.stock.analysis.market.mapper.StockMapper;
import com.stock.analysis.market.provider.ProviderManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class StockService {

    private final StockRepository stockRepository;
    private final LivePriceCacheRepository livePriceCacheRepository;
    private final StockMapper stockMapper;
    private final LivePriceMapper livePriceMapper;
    private final ProviderManager providerManager;
    private final CacheService cacheService;

    public StockService(
            StockRepository stockRepository,
            LivePriceCacheRepository livePriceCacheRepository,
            StockMapper stockMapper,
            LivePriceMapper livePriceMapper,
            ProviderManager providerManager,
            CacheService cacheService) {
        this.stockRepository = stockRepository;
        this.livePriceCacheRepository = livePriceCacheRepository;
        this.stockMapper = stockMapper;
        this.livePriceMapper = livePriceMapper;
        this.providerManager = providerManager;
        this.cacheService = cacheService;
    }

    @Transactional(readOnly = true)
    public List<StockDto> getAllStocks() {
        return stockRepository.findAllActive().stream()
                .map(stockMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LivePriceDto getStockPriceDetails(String symbol) {
        cacheService.incrementStockView(symbol);

        // Try getting live price from DB cache
        Optional<LivePriceCache> dbCache = livePriceCacheRepository.findByStockSymbol(symbol);
        if (dbCache.isPresent()) {
            LivePriceCache cache = dbCache.get();
            // If cache is fresh (< 30 seconds old), return it
            if (cache.getLastUpdatedAt() != null && cache.getLastUpdatedAt().isAfter(Instant.now().minusSeconds(30))) {
                return livePriceMapper.toDto(cache);
            }
        }

        // Fetch fresh price from provider manager
        try {
            LivePriceDto livePrice = providerManager.getLivePrice(symbol);
            // Save or update live_prices_cache table
            Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol);
            if (stockOpt.isPresent()) {
                Stock stock = stockOpt.get();
                LivePriceCache cacheEntity = dbCache.orElseGet(() -> LivePriceCache.builder().stock(stock).build());
                cacheEntity.setPrice(livePrice.getPrice());
                cacheEntity.setChangeAmount(livePrice.getChangeAmount());
                cacheEntity.setChangePercent(livePrice.getChangePercent());
                cacheEntity.setBidPrice(livePrice.getBid());
                cacheEntity.setAskPrice(livePrice.getAsk());
                cacheEntity.setVolume(livePrice.getVolume() != null ? livePrice.getVolume() : 0L);
                cacheEntity.setLastUpdatedAt(Instant.now());
                livePriceCacheRepository.save(cacheEntity);
            }
            return livePrice;
        } catch (Exception ex) {
            log.warn("Could not fetch fresh live price for {}, falling back to DB cache if available", symbol);
            return dbCache.map(livePriceMapper::toDto)
                    .orElseThrow(() -> new ResourceNotFoundException("Stock live price not found for symbol: " + symbol));
        }
    }

    @Transactional(readOnly = true)
    public List<StockDto> searchStocks(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        List<Stock> localResults = stockRepository.searchStocks(query);
        if (!localResults.isEmpty()) {
            return localResults.stream().map(stockMapper::toDto).collect(Collectors.toList());
        }

        // Fallback to searching provider API
        try {
            return providerManager.searchStocks(query);
        } catch (Exception ex) {
            log.warn("Failed to search stocks via provider: {}", ex.getMessage());
            return List.of();
        }
    }

    @Transactional(readOnly = true)
    public List<StockDto> getMostViewedStocks(int limit) {
        Set<Object> symbols = cacheService.getMostViewedStocks(limit);
        List<StockDto> result = new ArrayList<>();
        for (Object symObj : symbols) {
            String symbol = symObj.toString();
            stockRepository.findBySymbol(symbol).ifPresent(stock -> result.add(stockMapper.toDto(stock)));
        }
        return result;
    }
}
