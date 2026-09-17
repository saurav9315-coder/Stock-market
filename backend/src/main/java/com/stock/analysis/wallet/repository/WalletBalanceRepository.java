package com.stock.analysis.wallet.repository;

import com.stock.analysis.wallet.WalletBalance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository("walletBalanceDomainRepository")
public interface WalletBalanceRepository extends JpaRepository<WalletBalance, UUID> {

    Optional<WalletBalance> findByWalletId(UUID walletId);

    Optional<WalletBalance> findByWalletUserId(UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT wb FROM WalletBalance wb WHERE wb.wallet.id = :walletId")
    Optional<WalletBalance> findByWalletIdWithLock(@Param("walletId") UUID walletId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT wb FROM WalletBalance wb WHERE wb.wallet.user.id = :userId")
    Optional<WalletBalance> findByWalletUserIdWithLock(@Param("userId") UUID userId);
}
