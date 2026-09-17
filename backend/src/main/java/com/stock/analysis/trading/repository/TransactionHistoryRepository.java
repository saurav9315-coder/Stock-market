package com.stock.analysis.trading.repository;

import com.stock.analysis.wallet.TransactionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, UUID> {

    Page<TransactionHistory> findByWalletUserId(UUID userId, Pageable pageable);

    Page<TransactionHistory> findByWalletId(UUID walletId, Pageable pageable);
}
