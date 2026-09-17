package com.stock.analysis.ai.repository;

import com.stock.analysis.ai.PromptHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PromptHistoryRepository extends JpaRepository<PromptHistory, UUID> {
    Page<PromptHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
