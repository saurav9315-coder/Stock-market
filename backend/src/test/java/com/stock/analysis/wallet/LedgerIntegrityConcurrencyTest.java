package com.stock.analysis.wallet;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.domain.LedgerType;
import com.stock.analysis.wallet.repository.WalletLedgerRepository;
import com.stock.analysis.wallet.service.LedgerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class LedgerIntegrityConcurrencyTest {

    @Mock
    private WalletLedgerRepository walletLedgerRepository;

    @InjectMocks
    private LedgerServiceImpl ledgerService;

    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        User testUser = User.builder()
                .id(UUID.randomUUID())
                .username("ledger_user")
                .build();

        testWallet = Wallet.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .currency("USD")
                .build();
    }

    @Test
    @DisplayName("Should successfully record immutable ledger entry")
    void testRecordLedgerEntry() {
        when(walletLedgerRepository.save(any(WalletLedger.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal amount = new BigDecimal("500.00");
        BigDecimal balanceAfter = new BigDecimal("10500.00");
        UUID refId = UUID.randomUUID();

        WalletLedger result = ledgerService.recordEntry(
                testWallet,
                amount,
                LedgerType.CREDIT,
                balanceAfter,
                "Deposit test",
                refId
        );

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(amount);
        assertThat(result.getBalanceAfter()).isEqualByComparingTo(balanceAfter);
        assertThat(result.getType()).isEqualTo(LedgerType.CREDIT.name());
        assertThat(result.getReferenceId()).isEqualTo(refId);
    }

    @Test
    @DisplayName("Should handle concurrent ledger recording requests without thread contention failures")
    void testConcurrentLedgerRecording() throws InterruptedException {
        when(walletLedgerRepository.save(any(WalletLedger.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    ledgerService.recordEntry(
                            testWallet,
                            new BigDecimal("100.00"),
                            LedgerType.CREDIT,
                            new BigDecimal("1000.00").add(BigDecimal.valueOf(index * 100)),
                            "Concurrent Deposit #" + index,
                            UUID.randomUUID()
                    );
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    System.err.println("Thread failed: " + e.getMessage());
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(threadCount);
    }
}
