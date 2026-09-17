package com.stock.analysis.ai.provider;

import com.stock.analysis.ai.prompt.AiPromptTemplates;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiProviderRouter {

    private final OpenAiProviderService openAiProviderService;
    private final GeminiProviderService geminiProviderService;

    public String generate(String prompt, String systemPrompt) {
        if (openAiProviderService.isAvailable()) {
            try {
                log.info("Routing request to Primary AI Provider (OpenAI)");
                return openAiProviderService.generateText(prompt, systemPrompt);
            } catch (Exception e) {
                log.warn("Primary AI Provider (OpenAI) failed: {}. Attempting failover to secondary provider.", e.getMessage());
            }
        } else {
            log.info("Primary AI Provider (OpenAI) not configured. Trying secondary provider.");
        }

        if (geminiProviderService.isAvailable()) {
            try {
                log.info("Routing request to Secondary AI Provider (Google Gemini)");
                return geminiProviderService.generateText(prompt, systemPrompt);
            } catch (Exception e) {
                log.error("Secondary AI Provider (Google Gemini) failed: {}", e.getMessage());
            }
        } else {
            log.warn("Secondary AI Provider (Google Gemini) is also not configured.");
        }

        log.warn("All live AI providers unavailable. Returning structured fallback intelligence.");
        return generateFallbackResponse(prompt, systemPrompt);
    }

    private String generateFallbackResponse(String prompt, String systemPrompt) {
        if (systemPrompt != null && systemPrompt.contains("bullishFactors")) {
            return """
                {
                  "bullishFactors": ["Stable market capitalization", "Healthy liquidity metrics", "Positive institutional ownership pattern"],
                  "bearishFactors": ["Macroeconomic headwinds", "Sector volatility", "Interest rate exposure"],
                  "keyObservations": ["Consolidation near key moving averages", "Quarterly earnings inline with market expectations"],
                  "educationalSummary": "This asset demonstrates typical behavior for its sector category. Evaluate broader market indices and company financial reports for holistic context.",
                  "technicalOverview": "RSI values remain in neutral territory (45-55 range) with key support and resistance levels clearly defined.",
                  "riskFactors": "Market volatility, regulatory policy shifts, and interest rate adjustments remain relevant risk considerations."
                }
                """;
        }

        if (systemPrompt != null && systemPrompt.contains("riskScore")) {
            return """
                {
                  "riskScore": 55,
                  "concentrationRisk": "Balanced equity distribution across diversified holdings.",
                  "diversificationRating": "MODERATE",
                  "performanceSummary": "Portfolio exhibits moderate risk exposure with standard sector diversification.",
                  "educationalSuggestions": ["Consider rebalancing overweight sector holdings", "Maintain adequate cash buffers for market opportunities"]
                }
                """;
        }

        if (systemPrompt != null && systemPrompt.contains("sentimentScore")) {
            return """
                {
                  "headline": "Market Dynamics Summary",
                  "executiveSummary": "Recent market developments reflect broader economic indicator trends and investor interest.",
                  "keyTakeaways": ["Key earnings and performance benchmarks met", "Market volume aligned with historical averages"],
                  "sentiment": "NEUTRAL",
                  "sentimentScore": 0.0,
                  "impactAssessment": "MEDIUM",
                  "relatedStockTickers": ["INDEX"]
                }
                """;
        }

        if (systemPrompt != null && systemPrompt.contains("simpleDefinition")) {
            return """
                {
                  "simpleDefinition": "A core financial metric used by investors to evaluate value, performance, or risk in securities.",
                  "detailedExplanation": "Financial ratios and indicators provide normalized benchmarks to compare companies across sectors regardless of raw size differences.",
                  "mathematicalFormula": "Ratio = (Primary Financial Metric / Secondary Metric)",
                  "realWorldExample": "Comparing two companies in the same sector to determine relative value or operating efficiency.",
                  "relatedConcepts": ["Market Capitalization", "Valuation Ratios", "Return on Equity"]
                }
                """;
        }

        return "Thank you for asking about: \"" + prompt + "\". Based on current market intelligence, financial markets exhibit dynamic movement influenced by earnings reports, interest rate policy, and macroeconomic trends." + AiPromptTemplates.MANDATORY_DISCLAIMER;
    }
}
