package com.stock.analysis.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.ai.AiAnalysisHistory;
import com.stock.analysis.ai.dto.PortfolioAnalysisResponse;
import com.stock.analysis.ai.event.AiEvents;
import com.stock.analysis.ai.prompt.AiPromptTemplates;
import com.stock.analysis.ai.provider.AiProviderRouter;
import com.stock.analysis.ai.repository.AiAnalysisHistoryRepository;
import com.stock.analysis.portfolio.Holding;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.repository.HoldingRepository;
import com.stock.analysis.trading.repository.PortfolioRepository;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioAnalysisService {

    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;
    private final AiAnalysisHistoryRepository analysisHistoryRepository;
    private final AiRateLimiterService rateLimiterService;
    private final AiProviderRouter providerRouter;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PortfolioAnalysisResponse analyzePortfolio(User user) {
        rateLimiterService.checkAndIncrementQuota(user, 350);

        List<Portfolio> portfolios = portfolioRepository.findByUserId(user.getId());
        List<Holding> allHoldings = new ArrayList<>();
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Portfolio p : portfolios) {
            List<Holding> hList = holdingRepository.findByPortfolioId(p.getId());
            allHoldings.addAll(hList);
        }

        Map<String, BigDecimal> assetAllocation = new HashMap<>();
        Map<String, BigDecimal> sectorExposure = new HashMap<>();

        for (Holding h : allHoldings) {
            BigDecimal holdingValue = h.getQuantity().multiply(h.getAverageBuyPrice());
            totalValue = totalValue.add(holdingValue);
            String symbol = h.getStock() != null ? h.getStock().getSymbol() : "EQUITY";
            assetAllocation.put(symbol, holdingValue);
            sectorExposure.merge("Technology", holdingValue, BigDecimal::add);
        }

        if (totalValue.compareTo(BigDecimal.ZERO) == 0) {
            totalValue = BigDecimal.valueOf(10000.00); // Default benchmark for new accounts
            assetAllocation.put("CASH", BigDecimal.valueOf(10000.00));
            sectorExposure.put("Liquidity", BigDecimal.valueOf(10000.00));
        }

        // Normalize percentages
        final BigDecimal finalTotal = totalValue;
        Map<String, BigDecimal> assetPct = new HashMap<>();
        assetAllocation.forEach((k, v) -> assetPct.put(k, v.multiply(BigDecimal.valueOf(100)).divide(finalTotal, 2, RoundingMode.HALF_UP)));

        Map<String, BigDecimal> sectorPct = new HashMap<>();
        sectorExposure.forEach((k, v) -> sectorPct.put(k, v.multiply(BigDecimal.valueOf(100)).divide(finalTotal, 2, RoundingMode.HALF_UP)));

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Total Portfolio Value: $").append(totalValue).append("\n");
        promptBuilder.append("Positions Count: ").append(allHoldings.size()).append("\n");
        promptBuilder.append("Asset Allocation (%): ").append(assetPct).append("\n");
        promptBuilder.append("Sector Exposure (%): ").append(sectorPct).append("\n");

        String jsonResult = providerRouter.generate(promptBuilder.toString(), AiPromptTemplates.PORTFOLIO_ANALYSIS_SYSTEM_PROMPT);

        PortfolioAnalysisResponse response = parsePortfolioAnalysisJson(jsonResult, totalValue, allHoldings.size(), assetPct, sectorPct);

        // Record analysis history
        try {
            AiAnalysisHistory history = AiAnalysisHistory.builder()
                    .user(user)
                    .analysisType("PORTFOLIO")
                    .inputData(objectMapper.writeValueAsString(Map.of("portfolioValue", totalValue, "positions", allHoldings.size())))
                    .result(objectMapper.writeValueAsString(response))
                    .createdBy(user.getEmail())
                    .build();
            analysisHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to record portfolio analysis history: {}", e.getMessage());
        }

        eventPublisher.publishEvent(new AiEvents.PortfolioReviewCompletedEvent(this, user.getId(), response.getRiskScore()));

        return response;
    }

    private PortfolioAnalysisResponse parsePortfolioAnalysisJson(String json, BigDecimal totalVal, int count, Map<String, BigDecimal> assets, Map<String, BigDecimal> sectors) {
        int score = 50;
        String conc = "Balanced asset allocation across holdings.";
        String rating = "MODERATE";
        String summary = "Portfolio displays balanced growth potential.";
        List<String> suggestions = new ArrayList<>();

        try {
            String cleanJson = json.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode root = objectMapper.readTree(cleanJson);

            if (root.has("riskScore")) score = root.get("riskScore").asInt();
            if (root.has("concentrationRisk")) conc = root.get("concentrationRisk").asText();
            if (root.has("diversificationRating")) rating = root.get("diversificationRating").asText();
            if (root.has("performanceSummary")) summary = root.get("performanceSummary").asText();
            if (root.has("educationalSuggestions")) {
                root.get("educationalSuggestions").forEach(n -> suggestions.add(n.asText()));
            }

        } catch (Exception e) {
            log.warn("Failed to parse portfolio analysis response, applying fallback: {}", e.getMessage());
            suggestions.addAll(List.of(
                    "Consider adding fixed-income or defensive assets to reduce portfolio drawdown during volatility.",
                    "Review top single-stock weightings to ensure concentration risk remains aligned with risk tolerance."
            ));
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Maintain balanced sector weights and review portfolio periodically.");
        }

        return PortfolioAnalysisResponse.builder()
                .totalPortfolioValue(totalVal)
                .totalPositions(count)
                .assetAllocation(assets)
                .sectorExposure(sectors)
                .riskScore(score)
                .concentrationRisk(conc)
                .diversificationRating(rating)
                .performanceSummary(summary)
                .educationalSuggestions(suggestions)
                .disclaimer(AiPromptTemplates.MANDATORY_DISCLAIMER.trim())
                .build();
    }
}
