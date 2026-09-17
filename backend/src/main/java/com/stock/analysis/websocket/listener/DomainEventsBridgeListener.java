package com.stock.analysis.websocket.listener;

import com.stock.analysis.ai.event.AiEvents;
import com.stock.analysis.websocket.model.NotificationStreamPayload;
import com.stock.analysis.websocket.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DomainEventsBridgeListener {

    private final RealtimeEventPublisher eventPublisher;

    @EventListener
    public void handleAiAnalysisGenerated(AiEvents.AiAnalysisGeneratedEvent event) {
        log.info("Bridging AI Analysis Generated Event to WebSocket: User={}, Symbol={}", event.getUserId(), event.getSymbol());

        NotificationStreamPayload payload = NotificationStreamPayload.builder()
                .notificationId(UUID.randomUUID())
                .userId(event.getUserId())
                .category("AI_ALERT")
                .title("AI Analysis Completed")
                .message("AI analysis for symbol " + event.getSymbol() + " is ready to view.")
                .severity("INFO")
                .referenceUrl("/ai-analysis?symbol=" + event.getSymbol())
                .createdAt(Instant.now())
                .build();

        eventPublisher.publishNotification(event.getUserId().toString(), payload);
    }

    @EventListener
    public void handlePortfolioReviewCompleted(AiEvents.PortfolioReviewCompletedEvent event) {
        log.info("Bridging Portfolio Review Event to WebSocket: User={}, RiskScore={}", event.getUserId(), event.getRiskScore());

        NotificationStreamPayload payload = NotificationStreamPayload.builder()
                .notificationId(UUID.randomUUID())
                .userId(event.getUserId())
                .category("AI_ALERT")
                .title("Portfolio Risk Review Ready")
                .message("Your portfolio risk score is " + event.getRiskScore() + "/100. Review educational suggestions.")
                .severity("INFO")
                .referenceUrl("/portfolio")
                .createdAt(Instant.now())
                .build();

        eventPublisher.publishNotification(event.getUserId().toString(), payload);
    }

    @EventListener
    public void handleNewsSummarized(AiEvents.NewsSummarizedEvent event) {
        log.info("Bridging News Summarized Event to WebSocket: ArticleId={}", event.getArticleId());
    }
}
