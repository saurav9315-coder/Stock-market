package com.stock.analysis.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningExplainerResponse {
    private String term;
    private String simpleDefinition;
    private String detailedExplanation;
    private String mathematicalFormula;
    private String realWorldExample;
    private List<String> relatedConcepts;
    private String disclaimer;
}
