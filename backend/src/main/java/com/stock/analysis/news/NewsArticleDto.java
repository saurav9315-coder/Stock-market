package com.stock.analysis.news;

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
public class NewsArticleDto {
    private UUID id;
    private String title;
    private String content;
    private String source;
    private String url;
    private Instant publishedAt;
    private String sentiment; // BULLISH, BEARISH, NEUTRAL
}
