package com.stock.analysis.market.dto;

import com.stock.analysis.news.NewsArticleDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketOverviewDto {
    private List<MarketIndexDto> indices;
    private List<LivePriceDto> gainers;
    private List<LivePriceDto> losers;
    private List<NewsArticleDto> trendingNews;
}
