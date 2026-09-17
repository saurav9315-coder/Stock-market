package com.stock.analysis.ai.mapper;

import com.stock.analysis.ai.AiAnalysisHistory;
import com.stock.analysis.ai.AiConversation;
import com.stock.analysis.ai.AiMessage;
import com.stock.analysis.ai.dto.AiAnalysisHistoryResponse;
import com.stock.analysis.ai.dto.AiConversationResponse;
import com.stock.analysis.ai.dto.ChatMessageDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AiMapper {

    ChatMessageDto toChatMessageDto(AiMessage message);

    List<ChatMessageDto> toChatMessageDtoList(List<AiMessage> messages);

    AiConversationResponse toAiConversationResponse(AiConversation conversation);

    AiAnalysisHistoryResponse toAiAnalysisHistoryResponse(AiAnalysisHistory history);

    List<AiAnalysisHistoryResponse> toAiAnalysisHistoryResponseList(List<AiAnalysisHistory> histories);
}
