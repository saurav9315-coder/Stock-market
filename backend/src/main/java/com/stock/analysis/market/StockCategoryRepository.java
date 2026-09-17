package com.stock.analysis.market;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockCategoryRepository extends JpaRepository<StockCategory, UUID> {
    Optional<StockCategory> findByName(String name);
}
