package com.stock.analysis.ai.security;

import com.stock.analysis.ai.exception.PromptInjectionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Component
public class PromptSanitizer {

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)ignore\\s+(all\\s+)?previous\\s+instructions"),
            Pattern.compile("(?i)forget\\s+(all\\s+)?prior\\s+instructions"),
            Pattern.compile("(?i)disregard\\s+(all\\s+)?system\\s+instructions"),
            Pattern.compile("(?i)you\\s+are\\s+now\\s+(in\\s+)?developer\\s+mode"),
            Pattern.compile("(?i)override\\s+(all\\s+)?rules"),
            Pattern.compile("(?i)bypass\\s+security\\s+filters"),
            Pattern.compile("(?i)jailbreak"),
            Pattern.compile("(?i)system\\s*:\\s*you\\s+are")
    );

    public String sanitize(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String cleaned = input.trim();

        for (Pattern pattern : INJECTION_PATTERNS) {
            if (pattern.matcher(cleaned).find()) {
                log.warn("Prompt injection pattern detected in input: {}", cleaned);
                throw new PromptInjectionException("Input contains prohibited prompt override instructions.");
            }
        }

        return cleaned;
    }
}
