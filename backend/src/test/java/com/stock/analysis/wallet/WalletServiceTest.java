package com.stock.analysis.wallet;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.WalletResponse;
import com.stock.analysis.wallet.exception.InsufficientBalanceException;
import com.stock.analysis.wallet.repository.TransactionHistoryRepository;
import com.stock.analysis.wallet.repository.WalletBalanceRepository;
import com.stock.analysis.wallet.repository.WalletRepository;
import com.stock.analysis.wallet.service.WalletServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletBalanceRepository walletBalanceRepository;

    @Mock
    private TransactionHistoryRepository transactionHistoryRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private WalletServiceImpl walletService;

    private User testUser;
    private Wallet testWallet;
    private WalletBalance testBalance;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .build();
        testUser.setId(UUID.randomUUID());

        testWallet = Wallet.builder()
                .user(testUser)
                .currency("USD")
                .build();
        testWallet.setId(UUID.randomUUID());

        testBalance = WalletBalance.builder()
                .wallet(testWallet)
                .availableBalance(new BigDecimal("1000.0000"))
                .lockedBalance(new BigDecimal("200.0000"))
                .build();
        testBalance.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should return wallet details correctly")
    void testGetWalletDetails() {
        when(walletRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testWallet));
        when(walletBalanceRepository.findByWalletId(testWallet.getId())).thenReturn(Optional.of(testBalance));

        WalletResponse response = walletService.getWalletDetails(testUser);

        assertNotNull(response);
        assertEquals(testWallet.getId(), response.getWalletId());
        assertEquals(new BigDecimal("1000.0000"), response.getAvailableBalance());
        assertEquals(new BigDecimal("200.0000"), response.getLockedBalance());
        assertEquals(new BigDecimal("1200.0000"), response.getTotalBalance());
    }

    @Test
    @DisplayName("Should credit available balance successfully")
    void testCreditAvailableBalance() {
        when(walletBalanceRepository.findByWalletIdWithLock(testWallet.getId())).thenReturn(Optional.of(testBalance));
        when(walletBalanceRepository.save(any(WalletBalance.class))).thenAnswer(i -> i.getArgument(0));

        WalletBalance updated = walletService.creditAvailableBalance(testWallet, new BigDecimal("500.0000"));

        assertEquals(new BigDecimal("1500.0000"), updated.getAvailableBalance());
        verify(walletBalanceRepository).save(testBalance);
    }

    @Test
    @DisplayName("Should lock balance when sufficient available balance exists")
    void testLockBalanceSuccess() {
        when(walletBalanceRepository.findByWalletIdWithLock(testWallet.getId())).thenReturn(Optional.of(testBalance));
        when(walletBalanceRepository.save(any(WalletBalance.class))).thenAnswer(i -> i.getArgument(0));

        WalletBalance updated = walletService.lockBalance(testWallet, new BigDecimal("300.0000"));

        assertEquals(new BigDecimal("700.0000"), updated.getAvailableBalance());
        assertEquals(new BigDecimal("500.0000"), updated.getLockedBalance());
    }

    @Test
    @DisplayName("Should throw InsufficientBalanceException when available balance is low")
    void testLockBalanceInsufficient() {
        when(walletBalanceRepository.findByWalletIdWithLock(testWallet.getId())).thenReturn(Optional.of(testBalance));

        assertThrows(InsufficientBalanceException.class, () ->
                walletService.lockBalance(testWallet, new BigDecimal("2000.0000")));
    }
}
