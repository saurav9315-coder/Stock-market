package com.stock.analysis.ai.service;

import com.stock.analysis.ai.AiConversation;
import com.stock.analysis.ai.AiMessage;
import com.stock.analysis.ai.PromptHistory;
import com.stock.analysis.ai.dto.AiChatRequest;
import com.stock.analysis.ai.dto.AiChatResponse;
import com.stock.analysis.ai.dto.AiConversationResponse;
import com.stock.analysis.ai.event.AiEvents;
import com.stock.analysis.ai.mapper.AiMapper;
import com.stock.analysis.ai.prompt.AiPromptTemplates;
import com.stock.analysis.ai.provider.AiProviderRouter;
import com.stock.analysis.ai.repository.AiConversationRepository;
import com.stock.analysis.ai.repository.AiMessageRepository;
import com.stock.analysis.ai.repository.PromptHistoryRepository;
import com.stock.analysis.ai.security.PromptSanitizer;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiChatService {

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final PromptHistoryRepository promptHistoryRepository;
    private final AiRateLimiterService rateLimiterService;
    private final PromptSanitizer promptSanitizer;
    private final AiProviderRouter providerRouter;
    private final AiMapper aiMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AiChatResponse processChatMessage(User user, AiChatRequest request) {
        String sanitizedPrompt = promptSanitizer.sanitize(request.getPrompt());

        rateLimiterService.checkAndIncrementQuota(user, sanitizedPrompt.length() / 4 + 100);

        AiConversation conversation;
        boolean isNewConversation = false;

        if (request.getConversationId() != null) {
            conversation = conversationRepository.findByIdAndUserId(request.getConversationId(), user.getId())
                    .orElseGet(() -> createNewConversation(user, sanitizedPrompt));
        } else {
            conversation = createNewConversation(user, sanitizedPrompt);
            isNewConversation = true;
        }

        if (isNewConversation) {
            eventPublisher.publishEvent(new AiEvents.AiChatStartedEvent(this, user.getId(), conversation.getId()));
        }

        // Save User Message
        AiMessage userMessage = AiMessage.builder()
                .conversation(conversation)
                .role("USER")
                .content(sanitizedPrompt)
                .tokensUsed(sanitizedPrompt.length() / 4)
                .createdBy(user.getEmail())
                .build();
        messageRepository.save(userMessage);

        // Build context from conversation history
        List<AiMessage> history = messageRepository.findTop10ByConversationIdOrderByCreatedAtDesc(conversation.getId());
        StringBuilder contextBuilder = new StringBuilder();
        for (int i = history.size() - 1; i >= 0; i--) {
            AiMessage msg = history.get(i);
            contextBuilder.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
        }

        String fullPrompt = contextBuilder.toString() + "\nUSER: " + sanitizedPrompt;

        // Generate response using router
        String rawResponse = providerRouter.generate(fullPrompt, AiPromptTemplates.CHAT_SYSTEM_PROMPT);

        String finalResponseContent = rawResponse;
        if (!finalResponseContent.contains("Disclaimer:")) {
            finalResponseContent += AiPromptTemplates.MANDATORY_DISCLAIMER;
        }

        int responseTokens = finalResponseContent.length() / 4;

        // Save Assistant Message
        AiMessage assistantMessage = AiMessage.builder()
                .conversation(conversation)
                .role("ASSISTANT")
                .content(finalResponseContent)
                .tokensUsed(responseTokens)
                .createdBy("AI_ASSISTANT")
                .build();
        messageRepository.save(assistantMessage);

        // Save Prompt History
        PromptHistory promptHistory = PromptHistory.builder()
                .user(user)
                .promptTemplateName("AI_CHAT_DEFAULT")
                .filledPrompt(sanitizedPrompt)
                .createdBy(user.getEmail())
                .build();
        promptHistoryRepository.save(promptHistory);

        List<String> suggestedQuestions = List.of(
                "How do I analyze fundamental indicators for a stock?",
                "What is the difference between technical and fundamental analysis?",
                "How does portfolio diversification reduce volatility?"
        );

        return AiChatResponse.builder()
                .conversationId(conversation.getId())
                .messageId(assistantMessage.getId())
                .role("ASSISTANT")
                .content(finalResponseContent)
                .tokensUsed(userMessage.getTokensUsed() + responseTokens)
                .suggestedFollowUpQuestions(suggestedQuestions)
                .disclaimer(AiPromptTemplates.MANDATORY_DISCLAIMER.trim())
                .build();
    }

    private AiConversation createNewConversation(User user, String initialPrompt) {
        String title = initialPrompt.length() > 40 ? initialPrompt.substring(0, 37) + "..." : initialPrompt;
        AiConversation conv = AiConversation.builder()
                .user(user)
                .title(title)
                .createdBy(user.getEmail())
                .build();
        return conversationRepository.save(conv);
    }

    @Transactional(readOnly = true)
    public Page<AiConversationResponse> getUserConversations(User user, Pageable pageable) {
        Page<AiConversation> page = conversationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        List<UUID> convIds = page.getContent().stream().map(AiConversation::getId).toList();

        Map<UUID, List<AiMessage>> messagesByConvId = convIds.isEmpty() ? Map.of() :
                messageRepository.findByConversationIdInOrderByCreatedAtAsc(convIds).stream()
                        .collect(Collectors.groupingBy(m -> m.getConversation().getId()));

        return page.map(conv -> {
            AiConversationResponse resp = aiMapper.toAiConversationResponse(conv);
            List<AiMessage> msgs = messagesByConvId.getOrDefault(conv.getId(), List.of());
            resp.setMessages(aiMapper.toChatMessageDtoList(msgs));
            return resp;
        });
    }

    @Transactional(readOnly = true)
    public AiConversationResponse getConversationDetails(User user, UUID conversationId) {
        AiConversation conversation = conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found for specified user."));
        List<AiMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        AiConversationResponse response = aiMapper.toAiConversationResponse(conversation);
        response.setMessages(aiMapper.toChatMessageDtoList(messages));
        return response;
    }

    @Transactional
    public void deleteConversation(User user, UUID conversationId) {
        conversationRepository.findByIdAndUserId(conversationId, user.getId())
                .ifPresent(conv -> {
                    messageRepository.deleteByConversationId(conv.getId());
                    conversationRepository.delete(conv);
                });
    }
}
