package com.stock.analysis.market.controller;

import com.stock.analysis.market.dto.LivePriceDto;
import com.stock.analysis.market.dto.StockDto;
import com.stock.analysis.market.service.CompanyService;
import com.stock.analysis.market.service.HistoricalDataService;
import com.stock.analysis.market.service.MarketService;
import com.stock.analysis.market.service.StockService;
import com.stock.analysis.news.NewsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;

    @MockBean
    private org.springframework.data.redis.connection.RedisConnectionFactory redisConnectionFactory;

    @MockBean
    private org.springframework.data.redis.connection.ReactiveRedisConnectionFactory reactiveRedisConnectionFactory;

    @MockBean
    private StockService stockService;

    @MockBean
    private CompanyService companyService;

    @MockBean
    private HistoricalDataService historicalDataService;

    @MockBean
    private MarketService marketService;

    @MockBean
    private NewsService newsService;

    @Test
    @WithMockUser
    void getAllStocks_ReturnsSuccess() throws Exception {
        StockDto stock = StockDto.builder().symbol("AAPL").name("Apple Inc.").build();
        when(stockService.getAllStocks()).thenReturn(List.of(stock));

        mockMvc.perform(get("/market/stocks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data[0].symbol").value("AAPL"));
    }

    @Test
    @WithMockUser
    void getStockDetails_ReturnsLivePrice() throws Exception {
        LivePriceDto price = LivePriceDto.builder().symbol("AAPL").price(BigDecimal.valueOf(180.0)).build();
        when(stockService.getStockPriceDetails("AAPL")).thenReturn(price);

        mockMvc.perform(get("/market/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.symbol").value("AAPL"))
                .andExpect(jsonPath("$.data.price").value(180.0));
    }
}
