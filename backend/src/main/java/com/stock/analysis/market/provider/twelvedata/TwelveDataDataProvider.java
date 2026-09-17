package com.stock.analysis.market.provider.twelvedata;

import com.stock.analysis.market.dto.CompanyProfileDto;
import com.stock.analysis.market.dto.HistoricalPriceDto;
import com.stock.analysis.market.dto.LivePriceDto;
import com.stock.analysis.market.dto.StockDto;
import com.stock.analysis.market.provider.MarketDataProvider;
import com.stock.analysis.market.provider.ProviderType;
import com.stock.analysis.news.NewsArticleDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@SuppressWarnings("unchecked")
public class TwelveDataDataProvider implements MarketDataProvider {

    private final WebClient twelveDataWebClient;

    @Value("${app.stock-api.twelve-data.api-key:}")
    private String apiKey;

    public TwelveDataDataProvider(WebClient twelveDataWebClient) {
        this.twelveDataWebClient = twelveDataWebClient;
    }

    @Override
    public ProviderType getProviderType() {
        return ProviderType.TWELVE_DATA;
    }

    @Override
    @CircuitBreaker(name = "twelveDataService")
    @Retry(name = "twelveDataService")
    @RateLimiter(name = "twelveDataService")
    public LivePriceDto getLivePrice(String symbol) {
        log.info("Fetching live price for symbol {} from Twelve Data", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Twelve Data API key is not configured");
        }

        Map<String, Object> response = twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/quote")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null || response.containsKey("code")) {
            throw new RuntimeException("Failed to fetch quote from Twelve Data for symbol " + symbol);
        }

        BigDecimal price = toBigDecimal(response.get("close"));
        BigDecimal change = toBigDecimal(response.get("change"));
        BigDecimal percentChange = toBigDecimal(response.get("percent_change"));
        BigDecimal open = toBigDecimal(response.get("open"));
        BigDecimal high = toBigDecimal(response.get("high"));
        BigDecimal low = toBigDecimal(response.get("low"));

        return LivePriceDto.builder()
                .symbol(symbol)
                .price(price)
                .changeAmount(change)
                .changePercent(percentChange)
                .open(open)
                .high(high)
                .low(low)
                .lastUpdatedAt(Instant.now())
                .build();
    }

    @Override
    @CircuitBreaker(name = "twelveDataService")
    @Retry(name = "twelveDataService")
    @RateLimiter(name = "twelveDataService")
    public CompanyProfileDto getCompanyProfile(String symbol) {
        log.info("Fetching company profile for symbol {} from Twelve Data", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Twelve Data API key is not configured");
        }

        Map<String, Object> response = twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/profile")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null || response.containsKey("code")) {
            throw new RuntimeException("Failed to fetch company profile from Twelve Data for symbol " + symbol);
        }

        return CompanyProfileDto.builder()
                .symbol(symbol)
                .name((String) response.getOrDefault("name", symbol))
                .sector((String) response.get("sector"))
                .industry((String) response.get("industry"))
                .website((String) response.get("website"))
                .description((String) response.get("description"))
                .ceo((String) response.get("ceo"))
                .build();
    }

    @Override
    @CircuitBreaker(name = "twelveDataService")
    @Retry(name = "twelveDataService")
    @RateLimiter(name = "twelveDataService")
    public List<HistoricalPriceDto> getHistoricalData(String symbol, String resolution, Instant from, Instant to) {
        log.info("Fetching historical data for symbol {} from Twelve Data", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Twelve Data API key is not configured");
        }

        Map<String, Object> response = twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/time_series")
                        .queryParam("symbol", symbol)
                        .queryParam("interval", "1day")
                        .queryParam("outputsize", "30")
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<HistoricalPriceDto> list = new ArrayList<>();
        if (response != null && response.containsKey("values")) {
            List<Map<String, Object>> values = (List<Map<String, Object>>) response.get("values");
            for (Map<String, Object> val : values) {
                list.add(HistoricalPriceDto.builder()
                        .symbol(symbol)
                        .open(toBigDecimal(val.get("open")))
                        .high(toBigDecimal(val.get("high")))
                        .low(toBigDecimal(val.get("low")))
                        .close(toBigDecimal(val.get("close")))
                        .volume(toLong(val.get("volume")))
                        .timestamp(Instant.now())
                        .build());
            }
        }
        return list;
    }

    @Override
    @CircuitBreaker(name = "twelveDataService")
    @Retry(name = "twelveDataService")
    @RateLimiter(name = "twelveDataService")
    public List<NewsArticleDto> getMarketNews(String categoryOrSymbol) {
        log.warn("News not natively supported by Twelve Data fallback connector, returning empty list");
        return List.of();
    }

    @Override
    @CircuitBreaker(name = "twelveDataService")
    @Retry(name = "twelveDataService")
    @RateLimiter(name = "twelveDataService")
    public List<StockDto> searchStocks(String query) {
        log.info("Searching stocks for query {} from Twelve Data", query);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Twelve Data API key is not configured");
        }

        Map<String, Object> response = twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/symbol_search")
                        .queryParam("symbol", query)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<StockDto> stocks = new ArrayList<>();
        if (response != null && response.containsKey("data")) {
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
            for (Map<String, Object> item : data) {
                stocks.add(StockDto.builder()
                        .symbol((String) item.get("symbol"))
                        .name((String) item.get("instrument_name"))
                        .exchangeCode((String) item.get("exchange"))
                        .active(true)
                        .build());
            }
        }
        return stocks;
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(obj.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private Long toLong(Object obj) {
        if (obj == null) return 0L;
        try {
            return Long.parseLong(obj.toString());
        } catch (Exception e) {
            return 0L;
        }
    }
}
