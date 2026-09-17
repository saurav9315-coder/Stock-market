package com.stock.analysis.market.service;

import com.stock.analysis.market.LivePriceCacheRepository;
import com.stock.analysis.market.MarketIndexRepository;
import com.stock.analysis.market.dto.LivePriceDto;
import com.stock.analysis.market.dto.MarketIndexDto;
import com.stock.analysis.market.dto.MarketOverviewDto;
import com.stock.analysis.market.mapper.LivePriceMapper;
import com.stock.analysis.market.mapper.MarketIndexMapper;
import com.stock.analysis.news.NewsArticleDto;
import com.stock.analysis.news.NewsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MarketService {

    private final MarketIndexRepository marketIndexRepository;
    private final LivePriceCacheRepository livePriceCacheRepository;
    private final MarketIndexMapper marketIndexMapper;
    private final LivePriceMapper livePriceMapper;
    private final NewsService newsService;
    private final CacheService cacheService;

    public MarketService(
            MarketIndexRepository marketIndexRepository,
            LivePriceCacheRepository livePriceCacheRepository,
            MarketIndexMapper marketIndexMapper,
            LivePriceMapper livePriceMapper,
            NewsService newsService,
            CacheService cacheService) {
        this.marketIndexRepository = marketIndexRepository;
        this.livePriceCacheRepository = livePriceCacheRepository;
        this.marketIndexMapper = marketIndexMapper;
        this.livePriceMapper = livePriceMapper;
        this.newsService = newsService;
        this.cacheService = cacheService;
    }

    @Transactional(readOnly = true)
    public List<MarketIndexDto> getIndices() {
        return marketIndexRepository.findAll().stream()
                .map(marketIndexMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LivePriceDto> getTopGainers() {
        return livePriceCacheRepository.findTopGainers().stream()
                .limit(10)
                .map(livePriceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LivePriceDto> getTopLosers() {
        return livePriceCacheRepository.findTopLosers().stream()
                .limit(10)
                .map(livePriceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MarketOverviewDto getMarketOverview() {
        String cacheKey = "market_overview";
        MarketOverviewDto cached = (MarketOverviewDto) cacheService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        List<MarketIndexDto> indices = getIndices();
        List<LivePriceDto> gainers = getTopGainers();
        List<LivePriceDto> losers = getTopLosers();
        List<NewsArticleDto> news = newsService.getMarketNews("general");

        MarketOverviewDto overview = MarketOverviewDto.builder()
                .indices(indices)
                .gainers(gainers)
                .losers(losers)
                .trendingNews(news)
                .build();

        cacheService.put(cacheKey, overview, Duration.ofMinutes(5));
        return overview;
    }
}
