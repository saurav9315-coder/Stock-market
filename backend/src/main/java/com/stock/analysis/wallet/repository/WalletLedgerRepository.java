package com.stock.analysis.wallet.repository;

import com.stock.analysis.wallet.WalletLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletLedgerRepository extends JpaRepository<WalletLedger, UUID> {

    Page<WalletLedger> findByWalletId(UUID walletId, Pageable pageable);

    Page<WalletLedger> findByWalletUserId(UUID userId, Pageable pageable);

    Optional<WalletLedger> findTopByWalletIdOrderByCreatedAtDesc(UUID walletId);
}
