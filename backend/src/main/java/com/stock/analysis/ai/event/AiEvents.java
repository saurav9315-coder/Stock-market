package com.stock.analysis.ai.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

public class AiEvents {

    @Getter
    public static class AiChatStartedEvent extends ApplicationEvent {
        private final UUID userId;
        private final UUID conversationId;

        public AiChatStartedEvent(Object source, UUID userId, UUID conversationId) {
            super(source);
            this.userId = userId;
            this.conversationId = conversationId;
        }
    }

    @Getter
    public static class AiAnalysisGeneratedEvent extends ApplicationEvent {
        private final UUID userId;
        private final String analysisType;
        private final String symbol;

        public AiAnalysisGeneratedEvent(Object source, UUID userId, String analysisType, String symbol) {
            super(source);
            this.userId = userId;
            this.analysisType = analysisType;
            this.symbol = symbol;
        }
    }

    @Getter
    public static class NewsSummarizedEvent extends ApplicationEvent {
        private final UUID articleId;
        private final String sentiment;

        public NewsSummarizedEvent(Object source, UUID articleId, String sentiment) {
            super(source);
            this.articleId = articleId;
            this.sentiment = sentiment;
        }
    }

    @Getter
    public static class PortfolioReviewCompletedEvent extends ApplicationEvent {
        private final UUID userId;
        private final int riskScore;

        public PortfolioReviewCompletedEvent(Object source, UUID userId, int riskScore) {
            super(source);
            this.userId = userId;
            this.riskScore = riskScore;
        }
    }
}
