package com.stock.analysis.kyc;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KycRequestRepository extends JpaRepository<KycRequest, UUID> {

    Optional<KycRequest> findTopByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByStatus(String status);

    Page<KycRequest> findByStatus(String status, Pageable pageable);
}
