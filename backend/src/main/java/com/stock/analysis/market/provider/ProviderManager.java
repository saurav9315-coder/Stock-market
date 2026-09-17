package com.stock.analysis.market.provider;

import com.stock.analysis.market.dto.CompanyProfileDto;
import com.stock.analysis.market.dto.HistoricalPriceDto;
import com.stock.analysis.market.dto.LivePriceDto;
import com.stock.analysis.market.dto.StockDto;
import com.stock.analysis.news.NewsArticleDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.function.Function;

@Slf4j
@Service
public class ProviderManager {

    private final ProviderFactory providerFactory;

    private static final List<ProviderType> FAILOVER_CHAIN = List.of(
            ProviderType.FINNHUB,
            ProviderType.TWELVE_DATA,
            ProviderType.ALPHA_VANTAGE
    );

    public ProviderManager(ProviderFactory providerFactory) {
        this.providerFactory = providerFactory;
    }

    public LivePriceDto getLivePrice(String symbol) {
        return executeWithFailover(provider -> provider.getLivePrice(symbol), "getLivePrice(" + symbol + ")");
    }

    public CompanyProfileDto getCompanyProfile(String symbol) {
        return executeWithFailover(provider -> provider.getCompanyProfile(symbol), "getCompanyProfile(" + symbol + ")");
    }

    public List<HistoricalPriceDto> getHistoricalData(String symbol, String resolution, Instant from, Instant to) {
        return executeWithFailover(provider -> provider.getHistoricalData(symbol, resolution, from, to), "getHistoricalData(" + symbol + ")");
    }

    public List<NewsArticleDto> getMarketNews(String categoryOrSymbol) {
        return executeWithFailover(provider -> provider.getMarketNews(categoryOrSymbol), "getMarketNews(" + categoryOrSymbol + ")");
    }

    public List<StockDto> searchStocks(String query) {
        return executeWithFailover(provider -> provider.searchStocks(query), "searchStocks(" + query + ")");
    }

    private <R> R executeWithFailover(Function<MarketDataProvider, R> action, String operationName) {
        Throwable lastException = null;

        for (ProviderType providerType : FAILOVER_CHAIN) {
            try {
                MarketDataProvider provider = providerFactory.getProvider(providerType);
                log.debug("Executing {} using provider {}", operationName, providerType);
                return action.apply(provider);
            } catch (Exception ex) {
                lastException = ex;
                log.warn("Provider {} failed for operation {}: {}. Failing over to next provider...",
                        providerType, operationName, ex.getMessage());
            }
        }

        log.error("All market data providers failed for operation {}", operationName, lastException);
        throw new RuntimeException("All market data providers exhausted for operation " + operationName, lastException);
    }
}
