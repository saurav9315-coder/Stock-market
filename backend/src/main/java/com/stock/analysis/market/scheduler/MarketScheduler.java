package com.stock.analysis.market.scheduler;

import com.stock.analysis.market.service.CacheService;
import com.stock.analysis.market.service.MarketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MarketScheduler {

    private final MarketService marketService;
    private final CacheService cacheService;

    public MarketScheduler(
            MarketService marketService,
            CacheService cacheService) {
        this.marketService = marketService;
        this.cacheService = cacheService;
    }

    /**
     * Refresh market overview & indices every 5 minutes.
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void updateMarketOverview() {
        log.info("Scheduled Job: Refreshing market overview and indices...");
        try {
            cacheService.evict("market_overview");
            marketService.getMarketOverview();
            log.info("Scheduled Job: Market overview refreshed successfully.");
        } catch (Exception ex) {
            log.error("Scheduled Job Error: Failed to refresh market overview", ex);
        }
    }

    /**
     * Refresh top gainers and losers cache every 15 minutes.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void updateGainersAndLosers() {
        log.info("Scheduled Job: Updating top gainers and losers...");
        try {
            marketService.getTopGainers();
            marketService.getTopLosers();
            log.info("Scheduled Job: Top gainers and losers updated.");
        } catch (Exception ex) {
            log.error("Scheduled Job Error: Failed to update gainers and losers", ex);
        }
    }
}
