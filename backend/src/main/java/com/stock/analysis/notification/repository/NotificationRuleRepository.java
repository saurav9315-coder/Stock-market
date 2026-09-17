package com.stock.analysis.notification.repository;

import com.stock.analysis.notification.domain.NotificationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRuleRepository extends JpaRepository<NotificationRule, UUID> {

    List<NotificationRule> findByUserIdAndActiveTrue(UUID userId);

    List<NotificationRule> findBySymbolAndActiveTrue(String symbol);

    List<NotificationRule> findByActiveTrue();
}
