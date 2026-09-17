package com.stock.analysis.wallet;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.domain.LedgerType;
import com.stock.analysis.wallet.repository.WalletLedgerRepository;
import com.stock.analysis.wallet.service.LedgerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LedgerEngineTest {

    @Mock
    private WalletLedgerRepository walletLedgerRepository;

    @InjectMocks
    private LedgerServiceImpl ledgerService;

    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        User user = User.builder().username("ledgerUser").build();
        testWallet = Wallet.builder().user(user).build();
        testWallet.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should create immutable double-entry ledger entry for CREDIT")
    void testRecordCreditEntry() {
        when(walletLedgerRepository.save(any(WalletLedger.class))).thenAnswer(i -> i.getArgument(0));

        UUID refId = UUID.randomUUID();
        WalletLedger ledger = ledgerService.recordEntry(
                testWallet,
                new BigDecimal("500.0000"),
                LedgerType.CREDIT,
                new BigDecimal("1500.0000"),
                "Deposit Credit",
                refId
        );

        assertNotNull(ledger);
        assertEquals(new BigDecimal("500.0000"), ledger.getAmount());
        assertEquals("CREDIT", ledger.getType());
        assertEquals(new BigDecimal("1500.0000"), ledger.getBalanceAfter());
        assertEquals("Deposit Credit", ledger.getDescription());
        assertEquals(refId, ledger.getReferenceId());

        ArgumentCaptor<WalletLedger> captor = ArgumentCaptor.forClass(WalletLedger.class);
        verify(walletLedgerRepository).save(captor.capture());
        assertEquals("CREDIT", captor.getValue().getType());
    }
}
