package com.stock.analysis.wallet.repository;

import com.stock.analysis.wallet.TransactionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository("walletTransactionHistoryRepository")
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, UUID> {

    Page<TransactionHistory> findByWalletUserId(UUID userId, Pageable pageable);

    Page<TransactionHistory> findByWalletId(UUID walletId, Pageable pageable);

    @Query("SELECT th FROM TransactionHistory th WHERE th.wallet.user.id = :userId " +
           "AND (:type IS NULL OR th.type = :type) " +
           "AND (:status IS NULL OR th.status = :status) " +
           "AND (:startDate IS NULL OR th.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR th.createdAt <= :endDate)")
    Page<TransactionHistory> findFilteredHistory(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("status") String status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);
}
