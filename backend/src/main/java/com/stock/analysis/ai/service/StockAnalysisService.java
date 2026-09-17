package com.stock.analysis.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.ai.AiAnalysisHistory;
import com.stock.analysis.ai.dto.StockAnalysisRequest;
import com.stock.analysis.ai.dto.StockAnalysisResponse;
import com.stock.analysis.ai.event.AiEvents;
import com.stock.analysis.ai.prompt.AiPromptTemplates;
import com.stock.analysis.ai.provider.AiProviderRouter;
import com.stock.analysis.ai.repository.AiAnalysisHistoryRepository;
import com.stock.analysis.ai.security.PromptSanitizer;
import com.stock.analysis.market.CompanyProfile;
import com.stock.analysis.market.CompanyProfileRepository;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockAnalysisService {

    private final StockRepository stockRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final AiAnalysisHistoryRepository analysisHistoryRepository;
    private final AiRateLimiterService rateLimiterService;
    private final PromptSanitizer promptSanitizer;
    private final AiProviderRouter providerRouter;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public StockAnalysisResponse analyzeStock(User user, StockAnalysisRequest request) {
        String symbol = promptSanitizer.sanitize(request.getSymbol().toUpperCase().trim());

        rateLimiterService.checkAndIncrementQuota(user, 300);

        Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol);
        String companyName = stockOpt.map(Stock::getName).orElse(symbol + " Corp");
        BigDecimal currentPrice = BigDecimal.valueOf(150.00);

        Optional<CompanyProfile> profileOpt = stockOpt.flatMap(s -> companyProfileRepository.findById(s.getId()));

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Target Symbol: ").append(symbol).append("\n");
        promptBuilder.append("Company Name: ").append(companyName).append("\n");
        promptBuilder.append("Price Context: $").append(currentPrice).append("\n");

        profileOpt.ifPresent(profile -> {
            promptBuilder.append("Industry: ").append(profile.getIndustry()).append("\n");
            promptBuilder.append("Market Cap: $").append(profile.getMarketCap()).append("\n");
        });

        String jsonResult = providerRouter.generate(promptBuilder.toString(), AiPromptTemplates.STOCK_ANALYSIS_SYSTEM_PROMPT);

        StockAnalysisResponse response = parseStockAnalysisJson(jsonResult, symbol, companyName, currentPrice);

        // Record analysis history
        try {
            AiAnalysisHistory history = AiAnalysisHistory.builder()
                    .user(user)
                    .analysisType("STOCK")
                    .inputData(objectMapper.writeValueAsString(request))
                    .result(objectMapper.writeValueAsString(response))
                    .createdBy(user.getEmail())
                    .build();
            analysisHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to serialize AI analysis history: {}", e.getMessage());
        }

        eventPublisher.publishEvent(new AiEvents.AiAnalysisGeneratedEvent(this, user.getId(), "STOCK", symbol));

        return response;
    }

    private StockAnalysisResponse parseStockAnalysisJson(String json, String symbol, String name, BigDecimal price) {
        List<String> bullish = new ArrayList<>();
        List<String> bearish = new ArrayList<>();
        List<String> keyObs = new ArrayList<>();
        String summary = "Educational analysis completed.";
        String tech = "RSI and moving average indicators reviewed.";
        String risks = "Standard sector and macroeconomic risk factors apply.";

        try {
            String cleanJson = json.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode root = objectMapper.readTree(cleanJson);

            if (root.has("bullishFactors")) {
                root.get("bullishFactors").forEach(n -> bullish.add(n.asText()));
            }
            if (root.has("bearishFactors")) {
                root.get("bearishFactors").forEach(n -> bearish.add(n.asText()));
            }
            if (root.has("keyObservations")) {
                root.get("keyObservations").forEach(n -> keyObs.add(n.asText()));
            }
            if (root.has("educationalSummary")) summary = root.get("educationalSummary").asText();
            if (root.has("technicalOverview")) tech = root.get("technicalOverview").asText();
            if (root.has("riskFactors")) risks = root.get("riskFactors").asText();

        } catch (Exception e) {
            log.warn("Could not parse AI response as JSON, fallback applied: {}", e.getMessage());
            bullish.addAll(List.of("Strong balance sheet metrics", "Sustained revenue growth trajectory"));
            bearish.addAll(List.of("Short-term sector margin compression", "Macro economic interest rate headwinds"));
            keyObs.addAll(List.of("Trading near key resistance levels", "Healthy volume patterns"));
        }

        return StockAnalysisResponse.builder()
                .symbol(symbol)
                .companyName(name)
                .currentPrice(price)
                .bullishFactors(bullish)
                .bearishFactors(bearish)
                .keyObservations(keyObs)
                .educationalSummary(summary)
                .technicalOverview(tech)
                .riskFactors(risks)
                .disclaimer(AiPromptTemplates.MANDATORY_DISCLAIMER.trim())
                .build();
    }
}
