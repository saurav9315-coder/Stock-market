package com.stock.analysis.news;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, UUID> {
    List<NewsArticle> findAllByOrderByPublishedAtDesc();
    
    @Query("SELECT n FROM NewsCategory c JOIN c.newsArticles n WHERE c.id = :categoryId ORDER BY n.publishedAt DESC")
    List<NewsArticle> findByCategoryIdOrderByPublishedAtDesc(@Param("categoryId") UUID categoryId);
    
    @Query("SELECT n FROM NewsCategory c JOIN c.newsArticles n WHERE LOWER(c.name) = LOWER(:categoryName) ORDER BY n.publishedAt DESC")
    List<NewsArticle> findByCategoryNameOrderByPublishedAtDesc(@Param("categoryName") String categoryName);
}
