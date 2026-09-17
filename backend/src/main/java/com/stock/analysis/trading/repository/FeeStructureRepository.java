package com.stock.analysis.trading.repository;

import com.stock.analysis.trading.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, UUID> {

    Optional<FeeStructure> findByName(String name);

    Optional<FeeStructure> findFirstByActiveTrueOrderByCreatedAtDesc();
}
