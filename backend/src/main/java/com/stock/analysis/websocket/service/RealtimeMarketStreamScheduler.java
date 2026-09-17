package com.stock.analysis.websocket.service;

import com.stock.analysis.websocket.model.MarketStreamPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class RealtimeMarketStreamScheduler {

    private final RealtimeEventPublisher realtimeEventPublisher;
    private final Random random = new Random();

    private final List<StockBenchmark> benchmarks = List.of(
            new StockBenchmark("AAPL", "Apple Inc.", BigDecimal.valueOf(185.50), "STOCK"),
            new StockBenchmark("MSFT", "Microsoft Corp.", BigDecimal.valueOf(415.20), "STOCK"),
            new StockBenchmark("NVDA", "NVIDIA Corp.", BigDecimal.valueOf(125.80), "TOP_GAINER"),
            new StockBenchmark("TSLA", "Tesla Inc.", BigDecimal.valueOf(245.10), "TRENDING"),
            new StockBenchmark("SPY", "S&P 500 ETF", BigDecimal.valueOf(550.00), "INDEX")
    );

    @Scheduled(fixedRate = 2000)
    public void broadcastLiveMarketTicks() {
        for (StockBenchmark bench : benchmarks) {
            double deltaPercent = (random.nextDouble() * 1.0) - 0.48; // -0.48% to +0.52%
            BigDecimal currentPrice = bench.basePrice.multiply(BigDecimal.valueOf(1 + (deltaPercent / 100)))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal change = currentPrice.subtract(bench.basePrice).setScale(2, RoundingMode.HALF_UP);
            BigDecimal changePercent = BigDecimal.valueOf(deltaPercent).setScale(2, RoundingMode.HALF_UP);

            MarketStreamPayload payload = MarketStreamPayload.builder()
                    .symbol(bench.symbol)
                    .name(bench.name)
                    .price(currentPrice)
                    .change(change)
                    .changePercent(changePercent)
                    .dayHigh(currentPrice.multiply(BigDecimal.valueOf(1.02)).setScale(2, RoundingMode.HALF_UP))
                    .dayLow(currentPrice.multiply(BigDecimal.valueOf(0.98)).setScale(2, RoundingMode.HALF_UP))
                    .volume(1000000L + random.nextInt(500000))
                    .category(bench.category)
                    .timestamp(Instant.now())
                    .build();

            realtimeEventPublisher.publishMarketUpdate(payload);
        }
    }

    private record StockBenchmark(String symbol, String name, BigDecimal basePrice, String category) {}
}
