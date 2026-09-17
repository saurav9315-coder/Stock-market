package com.stock.analysis.market;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, UUID> {
    Optional<CompanyProfile> findByStockId(UUID stockId);
    Optional<CompanyProfile> findByStockSymbol(String symbol);
}
