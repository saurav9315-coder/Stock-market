package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.AiOperationsDtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAiOperationsService {

    public AiUsageStatsDto getAiUsageStats() {
        return AiUsageStatsDto.builder()
                .totalRequestsToday(1420L)
                .totalTokensConsumedToday(850000L)
                .estimatedCostTodayUsd(new BigDecimal("1.70"))
                .activeUsersToday(310L)
                .averageLatencyMs(420.5)
                .build();
    }

    public List<PromptTemplateDto> getPromptTemplates() {
        List<PromptTemplateDto> templates = new ArrayList<>();
        templates.add(PromptTemplateDto.builder()
                .templateKey("FINANCIAL_CHAT_SYSTEM_PROMPT")
                .name("Financial Advisor AI Assistant")
                .category("AI_CHAT")
                .systemPrompt("You are an expert financial analyst AI assistant.")
                .userPromptTemplate("User Query: {{query}}")
                .active(true)
                .version(1)
                .build());
        return templates;
    }

    public void updatePromptTemplate(PromptTemplateRequest request) {
        log.info("Admin updated AI prompt template {}", request.getTemplateKey());
    }

    public List<AiProviderHealthDto> getProviderHealth() {
        List<AiProviderHealthDto> health = new ArrayList<>();
        health.add(AiProviderHealthDto.builder()
                .providerName("Google Gemini API")
                .status("UP")
                .responseTimeMs(380L)
                .errorRatePercent(0.02)
                .lastCheckedAt(Instant.now())
                .build());
        return health;
    }
}
