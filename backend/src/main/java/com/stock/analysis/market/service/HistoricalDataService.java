package com.stock.analysis.market.service;

import com.stock.analysis.market.HistoricalPrice;
import com.stock.analysis.market.HistoricalPriceRepository;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.market.dto.HistoricalPriceDto;
import com.stock.analysis.market.mapper.HistoricalPriceMapper;
import com.stock.analysis.market.provider.ProviderManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class HistoricalDataService {

    private final HistoricalPriceRepository historicalPriceRepository;
    private final StockRepository stockRepository;
    private final HistoricalPriceMapper historicalPriceMapper;
    private final ProviderManager providerManager;
    private final CacheService cacheService;

    public HistoricalDataService(
            HistoricalPriceRepository historicalPriceRepository,
            StockRepository stockRepository,
            HistoricalPriceMapper historicalPriceMapper,
            ProviderManager providerManager,
            CacheService cacheService) {
        this.historicalPriceRepository = historicalPriceRepository;
        this.stockRepository = stockRepository;
        this.historicalPriceMapper = historicalPriceMapper;
        this.providerManager = providerManager;
        this.cacheService = cacheService;
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public List<HistoricalPriceDto> getHistoricalData(String symbol, String range) {
        Instant now = Instant.now();
        Instant from = calculateFromInstant(now, range);
        String cacheKey = "history:" + symbol + ":" + range;

        Object cachedObj = cacheService.get(cacheKey);
        if (cachedObj instanceof List<?> list && !list.isEmpty()) {
            return (List<HistoricalPriceDto>) list;
        }

        Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol);
        if (stockOpt.isPresent()) {
            List<HistoricalPrice> dbBars = historicalPriceRepository.findByStockIdAndTimestampBetween(stockOpt.get().getId(), from, now);
            if (!dbBars.isEmpty()) {
                List<HistoricalPriceDto> dtos = dbBars.stream().map(historicalPriceMapper::toDto).collect(Collectors.toList());
                cacheService.put(cacheKey, dtos, Duration.ofHours(1));
                return dtos;
            }
        }

        // Fetch from provider
        List<HistoricalPriceDto> fetched = providerManager.getHistoricalData(symbol, "D", from, now);

        if (stockOpt.isPresent() && !fetched.isEmpty()) {
            Stock stock = stockOpt.get();
            for (HistoricalPriceDto dto : fetched) {
                HistoricalPrice entity = historicalPriceMapper.toEntity(dto);
                entity.setId(UUID.randomUUID());
                entity.setStock(stock);
                historicalPriceRepository.save(entity);
            }
        }

        cacheService.put(cacheKey, fetched, Duration.ofHours(1));
        return fetched;
    }

    private Instant calculateFromInstant(Instant now, String range) {
        if (range == null) return now.minus(1, ChronoUnit.DAYS);
        return switch (range.toUpperCase()) {
            case "1D" -> now.minus(1, ChronoUnit.DAYS);
            case "5D" -> now.minus(5, ChronoUnit.DAYS);
            case "1M" -> now.minus(30, ChronoUnit.DAYS);
            case "6M" -> now.minus(180, ChronoUnit.DAYS);
            case "1Y" -> now.minus(365, ChronoUnit.DAYS);
            case "5Y" -> now.minus(5 * 365, ChronoUnit.DAYS);
            default -> now.minus(10 * 365, ChronoUnit.DAYS); // MAX
        };
    }
}
