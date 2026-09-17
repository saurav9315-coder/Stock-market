package com.stock.analysis.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningExplainerRequest {

    @NotBlank(message = "Financial term or concept cannot be empty")
    private String term;
}
