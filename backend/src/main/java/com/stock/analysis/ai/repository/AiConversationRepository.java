package com.stock.analysis.ai.repository;

import com.stock.analysis.ai.AiConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, UUID> {
    Page<AiConversation> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<AiConversation> findByIdAndUserId(UUID id, UUID userId);
    void deleteByIdAndUserId(UUID id, UUID userId);
}
