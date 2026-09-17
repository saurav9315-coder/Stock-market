package com.stock.analysis.ai.controller;

import com.stock.analysis.common.ApiResponse;
import com.stock.analysis.ai.dto.AiAnalysisHistoryResponse;
import com.stock.analysis.ai.dto.AiChatRequest;
import com.stock.analysis.ai.dto.AiChatResponse;
import com.stock.analysis.ai.dto.AiConversationResponse;
import com.stock.analysis.ai.dto.LearningExplainerRequest;
import com.stock.analysis.ai.dto.LearningExplainerResponse;
import com.stock.analysis.ai.dto.NewsSummaryRequest;
import com.stock.analysis.ai.dto.NewsSummaryResponse;
import com.stock.analysis.ai.dto.PortfolioAnalysisResponse;
import com.stock.analysis.ai.dto.StockAnalysisRequest;
import com.stock.analysis.ai.dto.StockAnalysisResponse;
import com.stock.analysis.ai.mapper.AiMapper;
import com.stock.analysis.ai.repository.AiAnalysisHistoryRepository;
import com.stock.analysis.ai.service.AiChatService;
import com.stock.analysis.ai.service.InvestmentLearningService;
import com.stock.analysis.ai.service.NewsIntelligenceService;
import com.stock.analysis.ai.service.PortfolioAnalysisService;
import com.stock.analysis.ai.service.StockAnalysisService;
import com.stock.analysis.users.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Investment Intelligence", description = "Endpoints for AI chat assistant, stock analysis, portfolio analysis, news intelligence, and financial learning.")
public class AiController {

    private final AiChatService chatService;
    private final StockAnalysisService stockAnalysisService;
    private final PortfolioAnalysisService portfolioAnalysisService;
    private final NewsIntelligenceService newsIntelligenceService;
    private final InvestmentLearningService learningService;
    private final AiAnalysisHistoryRepository historyRepository;
    private final AiMapper aiMapper;

    @PostMapping("/chat")
    @Operation(summary = "Send Chat Message", description = "Sends a message to the AI Chat Assistant and receives multi-turn conversational responses.")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = chatService.processChatMessage(user, request);
        return ResponseEntity.ok(ApiResponse.success("AI chat response generated successfully", response));
    }

    @GetMapping("/conversations")
    @Operation(summary = "List User Conversations", description = "Retrieves paginated conversation sessions for the authenticated user.")
    public ResponseEntity<ApiResponse<Page<AiConversationResponse>>> getConversations(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AiConversationResponse> conversations = chatService.getUserConversations(user, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @GetMapping("/conversations/{id}")
    @Operation(summary = "Get Conversation Messages", description = "Retrieves full message history for a specific conversation session.")
    public ResponseEntity<ApiResponse<AiConversationResponse>> getConversationDetails(
            @AuthenticationPrincipal User user,
            @PathVariable("id") UUID id) {
        AiConversationResponse conversation = chatService.getConversationDetails(user, id);
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }

    @DeleteMapping("/conversations/{id}")
    @Operation(summary = "Delete Conversation", description = "Deletes a specific AI conversation session and its message history.")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @AuthenticationPrincipal User user,
            @PathVariable("id") UUID id) {
        chatService.deleteConversation(user, id);
        return ResponseEntity.ok(ApiResponse.success("Conversation deleted successfully", null));
    }

    @PostMapping("/stock-analysis")
    @Operation(summary = "Analyze Stock", description = "Generates AI analysis for a stock symbol including bullish, bearish, key observations, and educational summaries.")
    public ResponseEntity<ApiResponse<StockAnalysisResponse>> analyzeStock(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody StockAnalysisRequest request) {
        StockAnalysisResponse response = stockAnalysisService.analyzeStock(user, request);
        return ResponseEntity.ok(ApiResponse.success("Stock analysis generated successfully", response));
    }

    @PostMapping("/portfolio-analysis")
    @Operation(summary = "Analyze Portfolio", description = "Generates portfolio breakdown, sector exposure, risk score, concentration risk, and educational suggestions.")
    public ResponseEntity<ApiResponse<PortfolioAnalysisResponse>> analyzePortfolio(
            @AuthenticationPrincipal User user) {
        PortfolioAnalysisResponse response = portfolioAnalysisService.analyzePortfolio(user);
        return ResponseEntity.ok(ApiResponse.success("Portfolio analysis completed successfully", response));
    }

    @PostMapping("/news-summary")
    @Operation(summary = "Summarize News", description = "Generates news summary, sentiment analysis, impact assessment, and related stock detection.")
    public ResponseEntity<ApiResponse<NewsSummaryResponse>> summarizeNews(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NewsSummaryRequest request) {
        NewsSummaryResponse response = newsIntelligenceService.summarizeNews(user, request);
        return ResponseEntity.ok(ApiResponse.success("News summarized successfully", response));
    }

    @PostMapping("/learning-explainer")
    @Operation(summary = "Explain Financial Concept", description = "Explains financial terms (e.g. P/E Ratio, Market Cap, SIP, CAGR) in beginner-friendly language.")
    public ResponseEntity<ApiResponse<LearningExplainerResponse>> explainConcept(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody LearningExplainerRequest request) {
        LearningExplainerResponse response = learningService.explainConcept(user, request);
        return ResponseEntity.ok(ApiResponse.success("Financial concept explained successfully", response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get User AI History", description = "Fetches historic AI analysis records generated for the authenticated user.")
    public ResponseEntity<ApiResponse<Page<AiAnalysisHistoryResponse>>> getAnalysisHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AiAnalysisHistoryResponse> history = historyRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(aiMapper::toAiAnalysisHistoryResponse);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @DeleteMapping("/history")
    @Operation(summary = "Clear User AI History", description = "Clears all saved AI analysis history records for the user.")
    public ResponseEntity<ApiResponse<Void>> clearAnalysisHistory(
            @AuthenticationPrincipal User user) {
        historyRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success("AI analysis history cleared successfully", null));
    }
}
