package com.stock.analysis.news;

import com.stock.analysis.market.provider.ProviderManager;
import com.stock.analysis.market.service.CacheService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NewsService {

    private final NewsArticleRepository newsArticleRepository;
    private final NewsArticleMapper newsArticleMapper;
    private final ProviderManager providerManager;
    private final CacheService cacheService;

    public NewsService(
            NewsArticleRepository newsArticleRepository,
            NewsArticleMapper newsArticleMapper,
            ProviderManager providerManager,
            CacheService cacheService) {
        this.newsArticleRepository = newsArticleRepository;
        this.newsArticleMapper = newsArticleMapper;
        this.providerManager = providerManager;
        this.cacheService = cacheService;
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public List<NewsArticleDto> getMarketNews(String categoryOrSymbol) {
        String key = "news:" + (categoryOrSymbol != null ? categoryOrSymbol : "general");
        Object cachedObj = cacheService.get(key);
        if (cachedObj instanceof List<?> list && !list.isEmpty()) {
            return (List<NewsArticleDto>) list;
        }

        // Try DB first
        List<NewsArticle> dbArticles = newsArticleRepository.findByCategoryNameOrderByPublishedAtDesc(categoryOrSymbol != null ? categoryOrSymbol : "general");
        if (!dbArticles.isEmpty()) {
            List<NewsArticleDto> dtos = dbArticles.stream().map(newsArticleMapper::toDto).collect(Collectors.toList());
            cacheService.put(key, dtos, Duration.ofMinutes(10));
            return dtos;
        }

        // Fetch from Provider
        List<NewsArticleDto> fetched = providerManager.getMarketNews(categoryOrSymbol);
        for (NewsArticleDto dto : fetched) {
            NewsArticle entity = newsArticleMapper.toEntity(dto);
            if (entity.getPublishedAt() == null) {
                entity.setPublishedAt(java.time.Instant.now());
            }
            if (entity.getSource() == null) {
                entity.setSource("Finnhub");
            }
            newsArticleRepository.save(entity);
        }

        cacheService.put(key, fetched, Duration.ofMinutes(10));
        return fetched;
    }
}
