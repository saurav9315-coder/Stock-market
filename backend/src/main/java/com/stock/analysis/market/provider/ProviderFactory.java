package com.stock.analysis.market.provider;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class ProviderFactory {

    private final Map<ProviderType, MarketDataProvider> providerMap;

    public ProviderFactory(List<MarketDataProvider> providers) {
        this.providerMap = providers.stream()
                .collect(Collectors.toMap(MarketDataProvider::getProviderType, Function.identity()));
    }

    public MarketDataProvider getProvider(ProviderType providerType) {
        MarketDataProvider provider = providerMap.get(providerType);
        if (provider == null) {
            throw new IllegalArgumentException("Unsupported provider type: " + providerType);
        }
        return provider;
    }
}
