package com.stock.analysis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class MarketDataConfig {

    @Value("${app.stock-api.finnhub.base-url:https://finnhub.io/api/v1}")
    private String finnhubBaseUrl;

    @Value("${app.stock-api.twelve-data.base-url:https://api.twelvedata.com}")
    private String twelveDataBaseUrl;

    @Value("${app.stock-api.alpha-vantage.base-url:https://www.alphavantage.co}")
    private String alphaVantageBaseUrl;

    @Bean
    public WebClient finnhubWebClient() {
        return WebClient.builder()
                .baseUrl(finnhubBaseUrl)
                .build();
    }

    @Bean
    public WebClient twelveDataWebClient() {
        return WebClient.builder()
                .baseUrl(twelveDataBaseUrl)
                .build();
    }

    @Bean
    public WebClient alphaVantageWebClient() {
        return WebClient.builder()
                .baseUrl(alphaVantageBaseUrl)
                .build();
    }
}
