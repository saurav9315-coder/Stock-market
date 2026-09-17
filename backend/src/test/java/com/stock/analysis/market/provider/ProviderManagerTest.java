package com.stock.analysis.market.provider;

import com.stock.analysis.market.dto.LivePriceDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ProviderManagerTest {

    @Mock
    private ProviderFactory providerFactory;

    @Mock
    private MarketDataProvider finnhubProvider;

    @Mock
    private MarketDataProvider twelveDataProvider;

    @Mock
    private MarketDataProvider alphaVantageProvider;

    private ProviderManager providerManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        when(finnhubProvider.getProviderType()).thenReturn(ProviderType.FINNHUB);
        when(twelveDataProvider.getProviderType()).thenReturn(ProviderType.TWELVE_DATA);
        when(alphaVantageProvider.getProviderType()).thenReturn(ProviderType.ALPHA_VANTAGE);

        when(providerFactory.getProvider(ProviderType.FINNHUB)).thenReturn(finnhubProvider);
        when(providerFactory.getProvider(ProviderType.TWELVE_DATA)).thenReturn(twelveDataProvider);
        when(providerFactory.getProvider(ProviderType.ALPHA_VANTAGE)).thenReturn(alphaVantageProvider);

        providerManager = new ProviderManager(providerFactory);
    }

    @Test
    void getLivePrice_PrimarySuccess_ReturnsPrice() {
        LivePriceDto expected = LivePriceDto.builder().symbol("AAPL").price(BigDecimal.valueOf(180.0)).build();
        when(finnhubProvider.getLivePrice("AAPL")).thenReturn(expected);

        LivePriceDto actual = providerManager.getLivePrice("AAPL");

        assertNotNull(actual);
        assertEquals(BigDecimal.valueOf(180.0), actual.getPrice());
        verify(finnhubProvider, times(1)).getLivePrice("AAPL");
        verify(twelveDataProvider, never()).getLivePrice(anyString());
    }

    @Test
    void getLivePrice_PrimaryFails_SecondarySucceeds() {
        when(finnhubProvider.getLivePrice("AAPL")).thenThrow(new RuntimeException("Rate limit reached"));

        LivePriceDto expected = LivePriceDto.builder().symbol("AAPL").price(BigDecimal.valueOf(180.0)).build();
        when(twelveDataProvider.getLivePrice("AAPL")).thenReturn(expected);

        LivePriceDto actual = providerManager.getLivePrice("AAPL");

        assertNotNull(actual);
        assertEquals(BigDecimal.valueOf(180.0), actual.getPrice());
        verify(finnhubProvider, times(1)).getLivePrice("AAPL");
        verify(twelveDataProvider, times(1)).getLivePrice("AAPL");
    }

    @Test
    void getLivePrice_AllFail_ThrowsException() {
        when(finnhubProvider.getLivePrice("AAPL")).thenThrow(new RuntimeException("Finnhub Failed"));
        when(twelveDataProvider.getLivePrice("AAPL")).thenThrow(new RuntimeException("TwelveData Failed"));
        when(alphaVantageProvider.getLivePrice("AAPL")).thenThrow(new RuntimeException("AlphaVantage Failed"));

        assertThrows(RuntimeException.class, () -> providerManager.getLivePrice("AAPL"));
    }
}
