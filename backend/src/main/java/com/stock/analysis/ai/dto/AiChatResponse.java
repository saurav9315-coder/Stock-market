package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {
    private UUID conversationId;
    private UUID messageId;
    private String role;
    private String content;
    private int tokensUsed;
    private List<String> suggestedFollowUpQuestions;
    private String disclaimer;
}
