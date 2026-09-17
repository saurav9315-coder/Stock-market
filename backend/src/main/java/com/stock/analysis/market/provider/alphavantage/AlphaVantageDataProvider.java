package com.stock.analysis.market.provider.alphavantage;

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
public class AlphaVantageDataProvider implements MarketDataProvider {

    private final WebClient alphaVantageWebClient;

    @Value("${app.stock-api.alpha-vantage.api-key:}")
    private String apiKey;

    public AlphaVantageDataProvider(WebClient alphaVantageWebClient) {
        this.alphaVantageWebClient = alphaVantageWebClient;
    }

    @Override
    public ProviderType getProviderType() {
        return ProviderType.ALPHA_VANTAGE;
    }

    @Override
    @CircuitBreaker(name = "alphaVantageService")
    @Retry(name = "alphaVantageService")
    @RateLimiter(name = "alphaVantageService")
    public LivePriceDto getLivePrice(String symbol) {
        log.info("Fetching live price for symbol {} from Alpha Vantage", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Alpha Vantage API key is not configured");
        }

        Map<String, Object> response = alphaVantageWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/query")
                        .queryParam("function", "GLOBAL_QUOTE")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null || !response.containsKey("Global Quote")) {
            throw new RuntimeException("Failed to fetch quote from Alpha Vantage for symbol " + symbol);
        }

        Map<String, Object> quote = (Map<String, Object>) response.get("Global Quote");
        BigDecimal price = toBigDecimal(quote.get("05. price"));
        BigDecimal change = toBigDecimal(quote.get("09. change"));
        BigDecimal percentChange = toBigDecimalClean(quote.get("10. change percent"));
        BigDecimal open = toBigDecimal(quote.get("02. open"));
        BigDecimal high = toBigDecimal(quote.get("03. high"));
        BigDecimal low = toBigDecimal(quote.get("04. low"));
        BigDecimal prevClose = toBigDecimal(quote.get("08. previous close"));

        return LivePriceDto.builder()
                .symbol(symbol)
                .price(price)
                .changeAmount(change)
                .changePercent(percentChange)
                .open(open)
                .high(high)
                .low(low)
                .previousClose(prevClose)
                .lastUpdatedAt(Instant.now())
                .build();
    }

    @Override
    @CircuitBreaker(name = "alphaVantageService")
    @Retry(name = "alphaVantageService")
    @RateLimiter(name = "alphaVantageService")
    public CompanyProfileDto getCompanyProfile(String symbol) {
        log.info("Fetching company profile for symbol {} from Alpha Vantage", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Alpha Vantage API key is not configured");
        }

        Map<String, Object> response = alphaVantageWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/query")
                        .queryParam("function", "OVERVIEW")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null || !response.containsKey("Symbol")) {
            throw new RuntimeException("Failed to fetch company profile from Alpha Vantage for symbol " + symbol);
        }

        return CompanyProfileDto.builder()
                .symbol(symbol)
                .name((String) response.getOrDefault("Name", symbol))
                .sector((String) response.get("Sector"))
                .industry((String) response.get("Industry"))
                .description((String) response.get("Description"))
                .peRatio(toBigDecimal(response.get("PERatio")))
                .dividendYield(toBigDecimal(response.get("DividendYield")))
                .marketCap(toLong(response.get("MarketCapitalization")))
                .build();
    }

    @Override
    @CircuitBreaker(name = "alphaVantageService")
    @Retry(name = "alphaVantageService")
    @RateLimiter(name = "alphaVantageService")
    public List<HistoricalPriceDto> getHistoricalData(String symbol, String resolution, Instant from, Instant to) {
        log.info("Fetching historical data for symbol {} from Alpha Vantage", symbol);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Alpha Vantage API key is not configured");
        }

        Map<String, Object> response = alphaVantageWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/query")
                        .queryParam("function", "TIME_SERIES_DAILY")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<HistoricalPriceDto> list = new ArrayList<>();
        if (response != null && response.containsKey("Time Series (Daily)")) {
            Map<String, Object> ts = (Map<String, Object>) response.get("Time Series (Daily)");
            ts.forEach((key, val) -> {
                Map<String, Object> bar = (Map<String, Object>) val;
                list.add(HistoricalPriceDto.builder()
                        .symbol(symbol)
                        .open(toBigDecimal(bar.get("1. open")))
                        .high(toBigDecimal(bar.get("2. high")))
                        .low(toBigDecimal(bar.get("3. low")))
                        .close(toBigDecimal(bar.get("4. close")))
                        .volume(toLong(bar.get("5. volume")))
                        .timestamp(Instant.now())
                        .build());
            });
        }
        return list;
    }

    @Override
    @CircuitBreaker(name = "alphaVantageService")
    @Retry(name = "alphaVantageService")
    @RateLimiter(name = "alphaVantageService")
    public List<NewsArticleDto> getMarketNews(String categoryOrSymbol) {
        log.info("Fetching market news from Alpha Vantage");
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Alpha Vantage API key is not configured");
        }

        Map<String, Object> response = alphaVantageWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/query")
                        .queryParam("function", "NEWS_SENTIMENT")
                        .queryParam("tickers", categoryOrSymbol != null ? categoryOrSymbol : "AAPL")
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<NewsArticleDto> newsList = new ArrayList<>();
        if (response != null && response.containsKey("feed")) {
            List<Map<String, Object>> feed = (List<Map<String, Object>>) response.get("feed");
            for (Map<String, Object> item : feed) {
                newsList.add(NewsArticleDto.builder()
                        .title((String) item.get("title"))
                        .content((String) item.get("summary"))
                        .source((String) item.get("source"))
                        .url((String) item.get("url"))
                        .publishedAt(Instant.now())
                        .sentiment((String) item.get("overall_sentiment_label"))
                        .build());
            }
        }
        return newsList;
    }

    @Override
    @CircuitBreaker(name = "alphaVantageService")
    @Retry(name = "alphaVantageService")
    @RateLimiter(name = "alphaVantageService")
    public List<StockDto> searchStocks(String query) {
        log.info("Searching stocks for query {} from Alpha Vantage", query);
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Alpha Vantage API key is not configured");
        }

        Map<String, Object> response = alphaVantageWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/query")
                        .queryParam("function", "SYMBOL_SEARCH")
                        .queryParam("keywords", query)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        List<StockDto> stocks = new ArrayList<>();
        if (response != null && response.containsKey("bestMatches")) {
            List<Map<String, Object>> matches = (List<Map<String, Object>>) response.get("bestMatches");
            for (Map<String, Object> item : matches) {
                stocks.add(StockDto.builder()
                        .symbol((String) item.get("1. symbol"))
                        .name((String) item.get("2. name"))
                        .active(true)
                        .build());
            }
        }
        return stocks;
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(obj.toString().trim());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private BigDecimal toBigDecimalClean(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        try {
            String str = obj.toString().replace("%", "").trim();
            return new BigDecimal(str);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private Long toLong(Object obj) {
        if (obj == null) return 0L;
        try {
            return Long.parseLong(obj.toString().trim());
        } catch (Exception e) {
            return 0L;
        }
    }
}
