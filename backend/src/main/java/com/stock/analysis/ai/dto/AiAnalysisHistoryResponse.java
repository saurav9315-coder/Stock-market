package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisHistoryResponse {
    private UUID id;
    private String analysisType;
    private String inputData;
    private String result;
    private Instant createdAt;
}
