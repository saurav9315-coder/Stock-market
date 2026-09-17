package com.stock.analysis.ai.repository;

import com.stock.analysis.ai.AiAnalysisHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AiAnalysisHistoryRepository extends JpaRepository<AiAnalysisHistory, UUID> {
    Page<AiAnalysisHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    void deleteByUserId(UUID userId);
}
