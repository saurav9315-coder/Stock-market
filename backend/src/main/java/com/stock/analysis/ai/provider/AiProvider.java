package com.stock.analysis.ai.provider;

public interface AiProvider {
    String generateText(String prompt, String systemPrompt);
    boolean isAvailable();
    String getProviderName();
}
