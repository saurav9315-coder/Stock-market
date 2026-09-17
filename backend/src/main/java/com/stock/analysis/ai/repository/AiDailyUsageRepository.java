package com.stock.analysis.ai.repository;

import com.stock.analysis.ai.AiDailyUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiDailyUsageRepository extends JpaRepository<AiDailyUsage, UUID> {
    Optional<AiDailyUsage> findByUserIdAndUsageDate(UUID userId, LocalDate usageDate);
}
