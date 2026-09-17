package com.stock.analysis.wallet;

import com.stock.analysis.kyc.KycRequest;
import com.stock.analysis.kyc.KycRequestRepository;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.domain.BankAccountStatus;
import com.stock.analysis.wallet.domain.WithdrawalStatus;
import com.stock.analysis.wallet.dto.AdminApprovalRequest;
import com.stock.analysis.wallet.dto.WithdrawalCreateRequest;
import com.stock.analysis.wallet.dto.WithdrawalResponse;
import com.stock.analysis.wallet.exception.KycNotVerifiedException;
import com.stock.analysis.wallet.repository.BankAccountRepository;
import com.stock.analysis.wallet.repository.WithdrawalRequestRepository;
import com.stock.analysis.wallet.service.AuditService;
import com.stock.analysis.wallet.service.LedgerService;
import com.stock.analysis.wallet.service.WalletService;
import com.stock.analysis.wallet.service.WithdrawalServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WithdrawalFlowTest {

    @Mock
    private WithdrawalRequestRepository withdrawalRequestRepository;
    @Mock
    private BankAccountRepository bankAccountRepository;
    @Mock
    private KycRequestRepository kycRequestRepository;
    @Mock
    private WalletService walletService;
    @Mock
    private LedgerService ledgerService;
    @Mock
    private AuditService auditService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private WithdrawalServiceImpl withdrawalService;

    private User testUser;
    private User adminUser;
    private Wallet testWallet;
    private BankAccount bankAccount;
    private UUID bankAccountId;

    @BeforeEach
    void setUp() {
        testUser = User.builder().username("withdrawer").email("w@example.com").build();
        testUser.setId(UUID.randomUUID());

        adminUser = User.builder().username("admin").build();
        adminUser.setId(UUID.randomUUID());

        testWallet = Wallet.builder().user(testUser).currency("USD").build();
        testWallet.setId(UUID.randomUUID());

        bankAccountId = UUID.randomUUID();
        bankAccount = BankAccount.builder()
                .user(testUser)
                .bankName("State Bank")
                .accountNumber("123456789")
                .accountHolderName("Withdrawer Name")
                .ifscSwift("SBIN000123")
                .verificationStatus(BankAccountStatus.VERIFIED)
                .build();
        bankAccount.setId(bankAccountId);
    }

    @Test
    @DisplayName("Should submit withdrawal request successfully when KYC is approved")
    void testSubmitWithdrawalSuccess() {
        KycRequest approvedKyc = KycRequest.builder().user(testUser).status("APPROVED").build();
        when(kycRequestRepository.findTopByUserIdOrderByCreatedAtDesc(testUser.getId())).thenReturn(Optional.of(approvedKyc));
        when(bankAccountRepository.findByIdAndUserId(bankAccountId, testUser.getId())).thenReturn(Optional.of(bankAccount));
        when(withdrawalRequestRepository.sumTotalWithdrawnSince(any(UUID.class), any(Instant.class))).thenReturn(BigDecimal.ZERO);
        when(walletService.getOrCreateWallet(testUser)).thenReturn(testWallet);
        when(withdrawalRequestRepository.save(any(WithdrawalRequest.class))).thenAnswer(i -> {
            WithdrawalRequest w = i.getArgument(0);
            w.setId(UUID.randomUUID());
            return w;
        });

        WithdrawalCreateRequest req = WithdrawalCreateRequest.builder()
                .amount(new BigDecimal("200.0000"))
                .currency("USD")
                .bankAccountId(bankAccountId)
                .build();

        WithdrawalResponse response = withdrawalService.submitWithdrawal(testUser, req);

        assertNotNull(response);
        assertEquals(WithdrawalStatus.PENDING, response.getStatus());
        assertEquals(new BigDecimal("200.0000"), response.getAmount());
        verify(walletService).lockBalance(testWallet, new BigDecimal("200.0000"));
    }

    @Test
    @DisplayName("Should throw KycNotVerifiedException when KYC is pending or missing")
    void testSubmitWithdrawalKycNotApproved() {
        when(kycRequestRepository.findTopByUserIdOrderByCreatedAtDesc(testUser.getId())).thenReturn(Optional.empty());

        WithdrawalCreateRequest req = WithdrawalCreateRequest.builder()
                .amount(new BigDecimal("200.0000"))
                .currency("USD")
                .bankAccountId(bankAccountId)
                .build();

        assertThrows(KycNotVerifiedException.class, () -> withdrawalService.submitWithdrawal(testUser, req));
    }

    @Test
    @DisplayName("Should approve withdrawal request, deduct locked balance, and record ledger")
    void testApproveWithdrawalSuccess() {
        UUID withdrawalId = UUID.randomUUID();
        WithdrawalRequest pending = WithdrawalRequest.builder()
                .wallet(testWallet)
                .amount(new BigDecimal("300.0000"))
                .currency("USD")
                .status(WithdrawalStatus.PENDING)
                .bankAccount(bankAccount)
                .build();
        pending.setId(withdrawalId);

        WalletBalance balance = WalletBalance.builder()
                .availableBalance(new BigDecimal("700.0000"))
                .lockedBalance(BigDecimal.ZERO)
                .build();

        when(withdrawalRequestRepository.findById(withdrawalId)).thenReturn(Optional.of(pending));
        when(withdrawalRequestRepository.save(any(WithdrawalRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(walletService.deductLockedBalance(testWallet, new BigDecimal("300.0000"))).thenReturn(balance);

        AdminApprovalRequest adminReq = AdminApprovalRequest.builder().adminNotes("Wire payout processed").build();

        WithdrawalResponse response = withdrawalService.approveWithdrawal(withdrawalId, adminReq, adminUser);

        assertEquals(WithdrawalStatus.COMPLETED, response.getStatus());
        verify(walletService).deductLockedBalance(testWallet, new BigDecimal("300.0000"));
        verify(ledgerService).recordEntry(any(), eq(new BigDecimal("300.0000")), any(), any(), any(), eq(withdrawalId));
    }
}
