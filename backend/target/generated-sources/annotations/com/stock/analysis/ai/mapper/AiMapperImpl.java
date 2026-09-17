package com.stock.analysis.ai.mapper;

import com.stock.analysis.ai.AiAnalysisHistory;
import com.stock.analysis.ai.AiConversation;
import com.stock.analysis.ai.AiMessage;
import com.stock.analysis.ai.dto.AiAnalysisHistoryResponse;
import com.stock.analysis.ai.dto.AiConversationResponse;
import com.stock.analysis.ai.dto.ChatMessageDto;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-01T18:49:57+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class AiMapperImpl implements AiMapper {

    @Override
    public ChatMessageDto toChatMessageDto(AiMessage message) {
        if ( message == null ) {
            return null;
        }

        ChatMessageDto.ChatMessageDtoBuilder chatMessageDto = ChatMessageDto.builder();

        chatMessageDto.content( message.getContent() );
        chatMessageDto.createdAt( message.getCreatedAt() );
        chatMessageDto.id( message.getId() );
        chatMessageDto.role( message.getRole() );
        chatMessageDto.tokensUsed( message.getTokensUsed() );

        return chatMessageDto.build();
    }

    @Override
    public List<ChatMessageDto> toChatMessageDtoList(List<AiMessage> messages) {
        if ( messages == null ) {
            return null;
        }

        List<ChatMessageDto> list = new ArrayList<ChatMessageDto>( messages.size() );
        for ( AiMessage aiMessage : messages ) {
            list.add( toChatMessageDto( aiMessage ) );
        }

        return list;
    }

    @Override
    public AiConversationResponse toAiConversationResponse(AiConversation conversation) {
        if ( conversation == null ) {
            return null;
        }

        AiConversationResponse.AiConversationResponseBuilder aiConversationResponse = AiConversationResponse.builder();

        aiConversationResponse.createdAt( conversation.getCreatedAt() );
        aiConversationResponse.id( conversation.getId() );
        aiConversationResponse.title( conversation.getTitle() );

        return aiConversationResponse.build();
    }

    @Override
    public AiAnalysisHistoryResponse toAiAnalysisHistoryResponse(AiAnalysisHistory history) {
        if ( history == null ) {
            return null;
        }

        AiAnalysisHistoryResponse.AiAnalysisHistoryResponseBuilder aiAnalysisHistoryResponse = AiAnalysisHistoryResponse.builder();

        aiAnalysisHistoryResponse.analysisType( history.getAnalysisType() );
        aiAnalysisHistoryResponse.createdAt( history.getCreatedAt() );
        aiAnalysisHistoryResponse.id( history.getId() );
        aiAnalysisHistoryResponse.inputData( history.getInputData() );
        aiAnalysisHistoryResponse.result( history.getResult() );

        return aiAnalysisHistoryResponse.build();
    }

    @Override
    public List<AiAnalysisHistoryResponse> toAiAnalysisHistoryResponseList(List<AiAnalysisHistory> histories) {
        if ( histories == null ) {
            return null;
        }

        List<AiAnalysisHistoryResponse> list = new ArrayList<AiAnalysisHistoryResponse>( histories.size() );
        for ( AiAnalysisHistory aiAnalysisHistory : histories ) {
            list.add( toAiAnalysisHistoryResponse( aiAnalysisHistory ) );
        }

        return list;
    }
}
