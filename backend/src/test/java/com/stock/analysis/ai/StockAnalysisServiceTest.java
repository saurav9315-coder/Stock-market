package com.stock.analysis.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.ai.dto.StockAnalysisRequest;
import com.stock.analysis.ai.dto.StockAnalysisResponse;
import com.stock.analysis.ai.provider.AiProviderRouter;
import com.stock.analysis.ai.repository.AiAnalysisHistoryRepository;
import com.stock.analysis.ai.security.PromptSanitizer;
import com.stock.analysis.ai.service.AiRateLimiterService;
import com.stock.analysis.ai.service.StockAnalysisService;
import com.stock.analysis.market.CompanyProfileRepository;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.users.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class StockAnalysisServiceTest {

    private StockRepository stockRepository;
    private CompanyProfileRepository companyProfileRepository;
    private AiAnalysisHistoryRepository analysisHistoryRepository;
    private AiRateLimiterService rateLimiterService;
    private PromptSanitizer promptSanitizer;
    private AiProviderRouter providerRouter;
    private ApplicationEventPublisher eventPublisher;
    private StockAnalysisService stockAnalysisService;

    @BeforeEach
    void setUp() {
        stockRepository = mock(StockRepository.class);
        companyProfileRepository = mock(CompanyProfileRepository.class);
        analysisHistoryRepository = mock(AiAnalysisHistoryRepository.class);
        rateLimiterService = mock(AiRateLimiterService.class);
        promptSanitizer = new PromptSanitizer();
        providerRouter = mock(AiProviderRouter.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        ObjectMapper objectMapper = new ObjectMapper();

        stockAnalysisService = new StockAnalysisService(
                stockRepository,
                companyProfileRepository,
                analysisHistoryRepository,
                rateLimiterService,
                promptSanitizer,
                providerRouter,
                objectMapper,
                eventPublisher
        );
    }

    @Test
    @DisplayName("Should analyze stock and return structured analysis response")
    void testAnalyzeStockSuccess() {
        User user = User.builder().id(UUID.randomUUID()).email("trader@example.com").build();
        StockAnalysisRequest request = StockAnalysisRequest.builder().symbol("AAPL").build();

        doNothing().when(rateLimiterService).checkAndIncrementQuota(any(), anyInt());
        when(stockRepository.findBySymbol("AAPL")).thenReturn(Optional.empty());

        String jsonAiResponse = """
            {
              "bullishFactors": ["Strong iPhone revenue", "Expanding services margin"],
              "bearishFactors": ["Regulatory scrutiny in EU"],
              "keyObservations": ["Consolidating near 50-day moving average"],
              "educationalSummary": "Apple demonstrates steady balance sheet health.",
              "technicalOverview": "RSI at 52 indicating neutral momentum.",
              "riskFactors": "Global supply chain and macroeconomic slowdown."
            }
            """;

        when(providerRouter.generate(anyString(), anyString())).thenReturn(jsonAiResponse);

        StockAnalysisResponse response = stockAnalysisService.analyzeStock(user, request);

        assertNotNull(response);
        assertEquals("AAPL", response.getSymbol());
        assertEquals(2, response.getBullishFactors().size());
        assertEquals(1, response.getBearishFactors().size());
        assertTrue(response.getDisclaimer().contains("Disclaimer"));
    }
}
