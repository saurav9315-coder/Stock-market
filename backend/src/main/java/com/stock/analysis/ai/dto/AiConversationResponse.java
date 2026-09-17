package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiConversationResponse {
    private UUID id;
    private String title;
    private Instant createdAt;
    private List<ChatMessageDto> messages;
}
