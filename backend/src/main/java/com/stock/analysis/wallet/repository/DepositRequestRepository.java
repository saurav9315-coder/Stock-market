package com.stock.analysis.wallet.repository;

import com.stock.analysis.wallet.DepositRequest;
import com.stock.analysis.wallet.domain.DepositStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepositRequestRepository extends JpaRepository<DepositRequest, UUID> {

    Page<DepositRequest> findByWalletUserId(UUID userId, Pageable pageable);

    Page<DepositRequest> findByStatus(DepositStatus status, Pageable pageable);

    Optional<DepositRequest> findByTransactionReference(String transactionReference);
}
