package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsSummaryRequest {

    private UUID articleId;

    private String rawNewsText;

    private String targetSymbol;
}
