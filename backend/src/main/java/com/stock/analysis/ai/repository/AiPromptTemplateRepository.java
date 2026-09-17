package com.stock.analysis.ai.repository;

import com.stock.analysis.ai.AiPromptTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiPromptTemplateRepository extends JpaRepository<AiPromptTemplate, UUID> {
    Optional<AiPromptTemplate> findByTemplateNameAndActiveTrue(String templateName);
}
