package com.stock.analysis.news;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsAiSummaryRepository extends JpaRepository<NewsAiSummary, UUID> {
    Optional<NewsAiSummary> findByNewsArticleId(UUID newsArticleId);
}
