package com.stock.analysis.trading.repository;

import com.stock.analysis.trading.entity.DiscountRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiscountRuleRepository extends JpaRepository<DiscountRule, UUID> {

    List<DiscountRule> findByFeeStructureIdAndActiveTrue(UUID feeStructureId);
}
