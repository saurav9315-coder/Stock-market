package com.stock.analysis.wallet.repository;

import com.stock.analysis.wallet.WithdrawalRequest;
import com.stock.analysis.wallet.domain.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, UUID> {

    Page<WithdrawalRequest> findByWalletUserId(UUID userId, Pageable pageable);

    Page<WithdrawalRequest> findByStatus(WithdrawalStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM WithdrawalRequest w WHERE w.wallet.user.id = :userId AND w.createdAt >= :since AND w.status IN ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED')")
    BigDecimal sumTotalWithdrawnSince(@Param("userId") UUID userId, @Param("since") Instant since);
}
