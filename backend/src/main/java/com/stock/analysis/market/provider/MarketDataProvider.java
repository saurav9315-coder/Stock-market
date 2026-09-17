package com.stock.analysis.market.provider;

import com.stock.analysis.market.dto.CompanyProfileDto;
import com.stock.analysis.market.dto.HistoricalPriceDto;
import com.stock.analysis.market.dto.LivePriceDto;
import com.stock.analysis.market.dto.StockDto;
import com.stock.analysis.news.NewsArticleDto;

import java.time.Instant;
import java.util.List;

public interface MarketDataProvider {

    ProviderType getProviderType();

    LivePriceDto getLivePrice(String symbol);

    CompanyProfileDto getCompanyProfile(String symbol);

    List<HistoricalPriceDto> getHistoricalData(String symbol, String resolution, Instant from, Instant to);

    List<NewsArticleDto> getMarketNews(String categoryOrSymbol);

    List<StockDto> searchStocks(String query);
}
