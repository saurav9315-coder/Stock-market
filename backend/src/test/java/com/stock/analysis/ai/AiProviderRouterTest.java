package com.stock.analysis.ai;

import com.stock.analysis.ai.provider.AiProviderRouter;
import com.stock.analysis.ai.provider.GeminiProviderService;
import com.stock.analysis.ai.provider.OpenAiProviderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiProviderRouterTest {

    private OpenAiProviderService openAiProviderService;
    private GeminiProviderService geminiProviderService;
    private AiProviderRouter router;

    @BeforeEach
    void setUp() {
        openAiProviderService = mock(OpenAiProviderService.class);
        geminiProviderService = mock(GeminiProviderService.class);
        router = new AiProviderRouter(openAiProviderService, geminiProviderService);
    }

    @Test
    @DisplayName("Should use OpenAI when available")
    void testOpenAiPrimarySuccess() {
        when(openAiProviderService.isAvailable()).thenReturn(true);
        when(openAiProviderService.generateText(anyString(), anyString())).thenReturn("OpenAI Response");

        String result = router.generate("Analyze AAPL", "System Prompt");

        assertNotNull(result);
        assertTrue(result.contains("OpenAI Response"));
        verify(openAiProviderService).generateText(anyString(), anyString());
    }

    @Test
    @DisplayName("Should failover to Gemini when OpenAI throws exception")
    void testOpenAiFailoverToGemini() {
        when(openAiProviderService.isAvailable()).thenReturn(true);
        when(openAiProviderService.generateText(anyString(), anyString())).thenThrow(new RuntimeException("Rate limited"));
        when(geminiProviderService.isAvailable()).thenReturn(true);
        when(geminiProviderService.generateText(anyString(), anyString())).thenReturn("Gemini Failover Response");

        String result = router.generate("Analyze AAPL", "System Prompt");

        assertNotNull(result);
        assertTrue(result.contains("Gemini Failover Response"));
        verify(geminiProviderService).generateText(anyString(), anyString());
    }

    @Test
    @DisplayName("Should return structured fallback response when both providers unavailable")
    void testFallbackWhenBothUnavailable() {
        when(openAiProviderService.isAvailable()).thenReturn(false);
        when(geminiProviderService.isAvailable()).thenReturn(false);

        String result = router.generate("Analyze AAPL", "bullishFactors system prompt");

        assertNotNull(result);
        assertTrue(result.contains("bullishFactors"));
    }
}
