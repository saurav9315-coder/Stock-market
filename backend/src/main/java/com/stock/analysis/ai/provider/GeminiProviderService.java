package com.stock.analysis.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiProviderService implements AiProvider {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String model;

    public GeminiProviderService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com/v1beta").build();
        this.objectMapper = objectMapper;
    }

    @Override
    public String generateText(String prompt, String systemPrompt) {
        if (!isAvailable()) {
            throw new IllegalStateException("Google Gemini API key is missing or not configured.");
        }

        try {
            String combinedPrompt = (systemPrompt != null && !systemPrompt.isBlank())
                    ? systemPrompt + "\n\nUser Request: " + prompt
                    : prompt;

            Map<String, Object> partMap = Map.of("text", combinedPrompt);
            Map<String, Object> contentMap = Map.of("parts", List.of(partMap));
            Map<String, Object> requestBody = Map.of("contents", List.of(contentMap));

            String uri = String.format("/models/%s:generateContent?key=%s", model, apiKey);

            String responseString = webClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(15));

            JsonNode root = objectMapper.readTree(responseString);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
            throw new RuntimeException("Empty response from Google Gemini API");

        } catch (Exception e) {
            log.error("Failed to execute Gemini API request: {}", e.getMessage());
            throw new RuntimeException("Gemini service execution failed: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("DEMO_KEY");
    }

    @Override
    public String getProviderName() {
        return "Google Gemini";
    }
}
