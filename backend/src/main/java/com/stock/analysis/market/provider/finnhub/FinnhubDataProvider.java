package com.stock.analysis.market.provider.finnhub;

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
public class FinnhubDataProvider implements MarketDataProvider {

    private final WebClient finnhubWebClient;

    @Value("${app.stock-api.finnhub.api-key:}")
    private String apiKey;

    public FinnhubDataProvider(WebClient finnhubWebClient) {
        this.finnhubWebClient = finnhubWebClient;
    }

    @Override
    public ProviderType getProviderType() {
        return ProviderType.FINNHUB;
    }

    @Override
    @CircuitBreaker(name = "finnhubService")
    @Retry(name = "finnhubService")
    @RateLimiter(name = "finnhubService")
    public LivePriceDto getLivePrice(String symbol) {
        log.info("Fetching live price for symbol {} from Finnhub", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Finnhub API key is not configured");
        }

        Map<String, Object> response = finnhubWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/quote")
                        .queryParam("symbol", symbol)
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null || !response.containsKey("c")) {
            throw new RuntimeException("Failed to parse response from Finnhub for symbol " + symbol);
        }

        BigDecimal current = toBigDecimal(response.get("c"));
        BigDecimal change = toBigDecimal(response.get("d"));
        BigDecimal percentChange = toBigDecimal(response.get("dp"));
        BigDecimal high = toBigDecimal(response.get("h"));
        BigDecimal low = toBigDecimal(response.get("l"));
        BigDecimal open = toBigDecimal(response.get("o"));
        BigDecimal prevClose = toBigDecimal(response.get("pc"));

        return LivePriceDto.builder()
                .symbol(symbol)
                .price(current)
                .changeAmount(change)
                .changePercent(percentChange)
                .high(high)
                .low(low)
                .open(open)
                .previousClose(prevClose)
                .lastUpdatedAt(Instant.now())
                .build();
    }

    @Override
    @CircuitBreaker(name = "finnhubService")
    @Retry(name = "finnhubService")
    @RateLimiter(name = "finnhubService")
    public CompanyProfileDto getCompanyProfile(String symbol) {
        log.info("Fetching company profile for symbol {} from Finnhub", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Finnhub API key is not configured");
        }

        Map<String, Object> response = finnhubWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/stock/profile2")
                        .queryParam("symbol", symbol)
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null || response.isEmpty()) {
            throw new RuntimeException("Failed to fetch company profile from Finnhub for symbol " + symbol);
        }

        return CompanyProfileDto.builder()
                .symbol(symbol)
                .name((String) response.getOrDefault("name", symbol))
                .industry((String) response.get("finnhubIndustry"))
                .website((String) response.get("weburl"))
                .marketCap(toLong(response.get("marketCapitalization")))
                .description((String) response.get("description"))
                .build();
    }

    @Override
    @CircuitBreaker(name = "finnhubService")
    @Retry(name = "finnhubService")
    @RateLimiter(name = "finnhubService")
    public List<HistoricalPriceDto> getHistoricalData(String symbol, String resolution, Instant from, Instant to) {
        log.info("Fetching historical data for symbol {} from Finnhub", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Finnhub API key is not configured");
        }

        long fromSec = from.getEpochSecond();
        long toSec = to.getEpochSecond();

        Map<String, Object> response = finnhubWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/stock/candle")
                        .queryParam("symbol", symbol)
                        .queryParam("resolution", resolution != null ? resolution : "D")
                        .queryParam("from", fromSec)
                        .queryParam("to", toSec)
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<HistoricalPriceDto> list = new ArrayList<>();
        if (response != null && "ok".equals(response.get("s"))) {
            List<Number> c = (List<Number>) response.get("c");
            List<Number> h = (List<Number>) response.get("h");
            List<Number> l = (List<Number>) response.get("l");
            List<Number> o = (List<Number>) response.get("o");
            List<Number> t = (List<Number>) response.get("t");
            List<Number> v = (List<Number>) response.get("v");

            if (c != null) {
                for (int i = 0; i < c.size(); i++) {
                    list.add(HistoricalPriceDto.builder()
                            .symbol(symbol)
                            .close(toBigDecimal(c.get(i)))
                            .high(h != null ? toBigDecimal(h.get(i)) : null)
                            .low(l != null ? toBigDecimal(l.get(i)) : null)
                            .open(o != null ? toBigDecimal(o.get(i)) : null)
                            .volume(v != null ? toLong(v.get(i)) : 0L)
                            .timestamp(t != null ? Instant.ofEpochSecond(toLong(t.get(i))) : Instant.now())
                            .build());
                }
            }
        }
        return list;
    }

    @Override
    @CircuitBreaker(name = "finnhubService")
    @Retry(name = "finnhubService")
    @RateLimiter(name = "finnhubService")
    public List<NewsArticleDto> getMarketNews(String categoryOrSymbol) {
        log.info("Fetching market news for {} from Finnhub", categoryOrSymbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Finnhub API key is not configured");
        }

        List<Map<String, Object>> response = finnhubWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/news")
                        .queryParam("category", categoryOrSymbol != null ? categoryOrSymbol : "general")
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                .collectList()
                .block();

        List<NewsArticleDto> newsList = new ArrayList<>();
        if (response != null) {
            for (Map<String, Object> item : response) {
                newsList.add(NewsArticleDto.builder()
                        .title((String) item.get("headline"))
                        .content((String) item.get("summary"))
                        .source((String) item.get("source"))
                        .url((String) item.get("url"))
                        .publishedAt(item.get("datetime") != null ? Instant.ofEpochSecond(toLong(item.get("datetime"))) : Instant.now())
                        .sentiment("NEUTRAL")
                        .build());
            }
        }
        return newsList;
    }

    @Override
    @CircuitBreaker(name = "finnhubService")
    @Retry(name = "finnhubService")
    @RateLimiter(name = "finnhubService")
    public List<StockDto> searchStocks(String query) {
        log.info("Searching stocks for query {} from Finnhub", query);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Finnhub API key is not configured");
        }

        Map<String, Object> response = finnhubWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", query)
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<StockDto> stocks = new ArrayList<>();
        if (response != null && response.containsKey("result")) {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("result");
            for (Map<String, Object> item : results) {
                stocks.add(StockDto.builder()
                        .symbol((String) item.get("symbol"))
                        .name((String) item.get("description"))
                        .active(true)
                        .build());
            }
        }
        return stocks;
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj instanceof Number num) {
            return BigDecimal.valueOf(num.doubleValue());
        }
        return BigDecimal.ZERO;
    }

    private Long toLong(Object obj) {
        if (obj instanceof Number num) {
            return num.longValue();
        }
        return 0L;
    }
}
