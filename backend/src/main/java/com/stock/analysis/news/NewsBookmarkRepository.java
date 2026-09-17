package com.stock.analysis.news;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsBookmarkRepository extends JpaRepository<NewsBookmark, UUID> {
    List<NewsBookmark> findByUserId(UUID userId);
    Optional<NewsBookmark> findByUserIdAndNewsArticleId(UUID userId, UUID newsArticleId);
    boolean existsByUserIdAndNewsArticleId(UUID userId, UUID newsArticleId);
}
