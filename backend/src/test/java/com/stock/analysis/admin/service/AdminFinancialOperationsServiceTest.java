package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.FinancialOperationDtos.DepositActionRequest;
import com.stock.analysis.admin.dto.FinancialOperationDtos.WithdrawalActionRequest;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.DepositRequest;
import com.stock.analysis.wallet.Wallet;
import com.stock.analysis.wallet.WalletBalance;
import com.stock.analysis.wallet.WithdrawalRequest;
import com.stock.analysis.wallet.domain.DepositStatus;
import com.stock.analysis.wallet.domain.WithdrawalStatus;
import com.stock.analysis.wallet.repository.DepositRequestRepository;
import com.stock.analysis.wallet.repository.WalletBalanceRepository;
import com.stock.analysis.wallet.repository.WithdrawalRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminFinancialOperationsServiceTest {

    @Mock
    private DepositRequestRepository depositRequestRepository;

    @Mock
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Mock
    private WalletBalanceRepository walletBalanceRepository;

    @InjectMocks
    private AdminFinancialOperationsService financialService;

    private Wallet wallet;
    private WalletBalance balance;
    private UUID walletId;

    @BeforeEach
    void setUp() {
        walletId = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).username("investor").email("inv@stock.com").build();
        wallet = Wallet.builder().id(walletId).user(user).currency("USD").build();
        balance = WalletBalance.builder()
                .wallet(wallet)
                .availableBalance(new BigDecimal("1000.00"))
                .lockedBalance(new BigDecimal("200.00"))
                .build();
    }

    @Test
    @DisplayName("Should approve deposit and credit wallet available balance")
    void testApproveDepositSuccess() {
        UUID depositId = UUID.randomUUID();
        DepositRequest deposit = DepositRequest.builder()
                .id(depositId)
                .wallet(wallet)
                .amount(new BigDecimal("500.00"))
                .status(DepositStatus.PENDING)
                .build();

        when(depositRequestRepository.findById(depositId)).thenReturn(Optional.of(deposit));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));

        DepositActionRequest request = DepositActionRequest.builder()
                .action("APPROVE")
                .internalNotes("Bank wire verified")
                .build();

        financialService.processDeposit(depositId, request);

        assertThat(deposit.getStatus()).isEqualTo(DepositStatus.APPROVED);
        assertThat(balance.getAvailableBalance()).isEqualByComparingTo("1500.00");
        verify(walletBalanceRepository).save(balance);
        verify(depositRequestRepository).save(deposit);
    }

    @Test
    @DisplayName("Should reject withdrawal and refund locked balance to available balance")
    void testRejectWithdrawalRefundsBalance() {
        UUID withdrawalId = UUID.randomUUID();
        WithdrawalRequest withdrawal = WithdrawalRequest.builder()
                .id(withdrawalId)
                .wallet(wallet)
                .amount(new BigDecimal("200.00"))
                .status(WithdrawalStatus.PENDING)
                .build();

        when(withdrawalRequestRepository.findById(withdrawalId)).thenReturn(Optional.of(withdrawal));
        when(walletBalanceRepository.findByWalletId(walletId)).thenReturn(Optional.of(balance));

        WithdrawalActionRequest request = WithdrawalActionRequest.builder()
                .action("REJECT")
                .reason("Invalid bank account number")
                .internalNotes("Account details mismatched")
                .build();

        financialService.processWithdrawal(withdrawalId, request);

        assertThat(withdrawal.getStatus()).isEqualTo(WithdrawalStatus.REJECTED);
        assertThat(balance.getAvailableBalance()).isEqualByComparingTo("1200.00");
        assertThat(balance.getLockedBalance()).isEqualByComparingTo("0.00");
        verify(walletBalanceRepository).save(balance);
        verify(withdrawalRequestRepository).save(withdrawal);
    }
}
