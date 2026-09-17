package com.stock.analysis.market.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.market.dto.CompanyProfileDto;
import com.stock.analysis.market.dto.HistoricalPriceDto;
import com.stock.analysis.market.dto.LivePriceDto;
import com.stock.analysis.market.dto.MarketIndexDto;
import com.stock.analysis.market.dto.MarketOverviewDto;
import com.stock.analysis.market.dto.StockDto;
import com.stock.analysis.market.service.CompanyService;
import com.stock.analysis.market.service.HistoricalDataService;
import com.stock.analysis.market.service.MarketService;
import com.stock.analysis.market.service.StockService;
import com.stock.analysis.news.NewsArticleDto;
import com.stock.analysis.news.NewsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/market")
public class MarketController {

    private final StockService stockService;
    private final CompanyService companyService;
    private final HistoricalDataService historicalDataService;
    private final MarketService marketService;
    private final NewsService newsService;

    public MarketController(
            StockService stockService,
            CompanyService companyService,
            HistoricalDataService historicalDataService,
            MarketService marketService,
            NewsService newsService) {
        this.stockService = stockService;
        this.companyService = companyService;
        this.historicalDataService = historicalDataService;
        this.marketService = marketService;
        this.newsService = newsService;
    }

    @GetMapping("/stocks")
    public ResponseEntity<ApiResponse<List<StockDto>>> getAllStocks() {
        log.info("REST Request: Get all active stocks");
        List<StockDto> stocks = stockService.getAllStocks();
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<ApiResponse<LivePriceDto>> getStockDetails(@PathVariable String symbol) {
        log.info("REST Request: Get details for symbol {}", symbol);
        LivePriceDto livePrice = stockService.getStockPriceDetails(symbol);
        return ResponseEntity.ok(ApiResponse.success(livePrice));
    }

    @GetMapping("/{symbol}/profile")
    public ResponseEntity<ApiResponse<CompanyProfileDto>> getCompanyProfile(@PathVariable String symbol) {
        log.info("REST Request: Get company profile for symbol {}", symbol);
        CompanyProfileDto profile = companyService.getCompanyProfile(symbol);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/{symbol}/history")
    public ResponseEntity<ApiResponse<List<HistoricalPriceDto>>> getHistoricalData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1D") String range) {
        log.info("REST Request: Get historical data for symbol {} with range {}", symbol, range);
        List<HistoricalPriceDto> history = historicalDataService.getHistoricalData(symbol, range);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<StockDto>>> searchStocks(@RequestParam String query) {
        log.info("REST Request: Search stocks with query {}", query);
        List<StockDto> results = stockService.searchStocks(query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/gainers")
    public ResponseEntity<ApiResponse<List<LivePriceDto>>> getTopGainers() {
        log.info("REST Request: Get top gainers");
        List<LivePriceDto> gainers = marketService.getTopGainers();
        return ResponseEntity.ok(ApiResponse.success(gainers));
    }

    @GetMapping("/losers")
    public ResponseEntity<ApiResponse<List<LivePriceDto>>> getTopLosers() {
        log.info("REST Request: Get top losers");
        List<LivePriceDto> losers = marketService.getTopLosers();
        return ResponseEntity.ok(ApiResponse.success(losers));
    }

    @GetMapping("/indices")
    public ResponseEntity<ApiResponse<List<MarketIndexDto>>> getIndices() {
        log.info("REST Request: Get market indices");
        List<MarketIndexDto> indices = marketService.getIndices();
        return ResponseEntity.ok(ApiResponse.success(indices));
    }

    @GetMapping("/news")
    public ResponseEntity<ApiResponse<List<NewsArticleDto>>> getMarketNews(
            @RequestParam(required = false, defaultValue = "general") String category) {
        log.info("REST Request: Get market news for category {}", category);
        List<NewsArticleDto> news = newsService.getMarketNews(category);
        return ResponseEntity.ok(ApiResponse.success(news));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<MarketOverviewDto>> getMarketOverview() {
        log.info("REST Request: Get market overview");
        MarketOverviewDto overview = marketService.getMarketOverview();
        return ResponseEntity.ok(ApiResponse.success(overview));
    }
}
