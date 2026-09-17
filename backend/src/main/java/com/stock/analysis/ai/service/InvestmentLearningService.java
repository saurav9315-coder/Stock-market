package com.stock.analysis.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.ai.dto.LearningExplainerRequest;
import com.stock.analysis.ai.dto.LearningExplainerResponse;
import com.stock.analysis.ai.prompt.AiPromptTemplates;
import com.stock.analysis.ai.provider.AiProviderRouter;
import com.stock.analysis.ai.security.PromptSanitizer;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvestmentLearningService {

    private final AiRateLimiterService rateLimiterService;
    private final PromptSanitizer promptSanitizer;
    private final AiProviderRouter providerRouter;
    private final ObjectMapper objectMapper;

    @Cacheable(value = "ai_learning_cache", key = "#request.term.toLowerCase().trim()", unless = "#result == null")
    public LearningExplainerResponse explainConcept(User user, LearningExplainerRequest request) {
        if (user != null) {
            rateLimiterService.checkAndIncrementQuota(user, 150);
        }

        String sanitizedTerm = promptSanitizer.sanitize(request.getTerm());

        String prompt = "Explain financial concept: " + sanitizedTerm;
        String jsonResult = providerRouter.generate(prompt, AiPromptTemplates.LEARNING_EXPLAINER_SYSTEM_PROMPT);

        return parseLearningExplainerJson(jsonResult, sanitizedTerm);
    }

    private LearningExplainerResponse parseLearningExplainerJson(String json, String term) {
        String def = "Core financial concept used in investing and market analysis.";
        String detailed = "Provides insights into market evaluation, corporate earnings, or investment returns.";
        String formula = "N/A or Ratio dependent";
        String example = "Comparing two investment assets to evaluate relative performance or value.";
        List<String> related = new ArrayList<>();

        try {
            String cleanJson = json.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode root = objectMapper.readTree(cleanJson);

            if (root.has("simpleDefinition")) def = root.get("simpleDefinition").asText();
            if (root.has("detailedExplanation")) detailed = root.get("detailedExplanation").asText();
            if (root.has("mathematicalFormula")) formula = root.get("mathematicalFormula").asText();
            if (root.has("realWorldExample")) example = root.get("realWorldExample").asText();
            if (root.has("relatedConcepts")) {
                root.get("relatedConcepts").forEach(n -> related.add(n.asText()));
            }

        } catch (Exception e) {
            log.warn("Failed to parse learning explainer JSON, applying fallback: {}", e.getMessage());
            related.addAll(List.of("Valuation Metrics", "Fundamental Analysis", "Market Capitalization"));
        }

        return LearningExplainerResponse.builder()
                .term(term)
                .simpleDefinition(def)
                .detailedExplanation(detailed)
                .mathematicalFormula(formula)
                .realWorldExample(example)
                .relatedConcepts(related)
                .disclaimer(AiPromptTemplates.MANDATORY_DISCLAIMER.trim())
                .build();
    }
}
