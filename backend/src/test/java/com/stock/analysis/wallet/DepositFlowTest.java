package com.stock.analysis.wallet;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.domain.DepositStatus;
import com.stock.analysis.wallet.domain.LedgerType;
import com.stock.analysis.wallet.dto.AdminApprovalRequest;
import com.stock.analysis.wallet.dto.DepositCreateRequest;
import com.stock.analysis.wallet.dto.DepositResponse;
import com.stock.analysis.wallet.exception.DuplicateTransactionException;
import com.stock.analysis.wallet.repository.DepositRequestRepository;
import com.stock.analysis.wallet.service.AuditService;
import com.stock.analysis.wallet.service.DepositServiceImpl;
import com.stock.analysis.wallet.service.LedgerService;
import com.stock.analysis.wallet.service.PaymentProofStorageService;
import com.stock.analysis.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
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
class DepositFlowTest {

    @Mock
    private DepositRequestRepository depositRequestRepository;
    @Mock
    private WalletService walletService;
    @Mock
    private LedgerService ledgerService;
    @Mock
    private PaymentProofStorageService paymentProofStorageService;
    @Mock
    private AuditService auditService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private DepositServiceImpl depositService;

    private User testUser;
    private User adminUser;
    private Wallet testWallet;
    private PaymentProof testProof;

    @BeforeEach
    void setUp() {
        testUser = User.builder().username("depositor").email("dep@example.com").build();
        testUser.setId(UUID.randomUUID());

        adminUser = User.builder().username("admin").email("admin@example.com").build();
        adminUser.setId(UUID.randomUUID());

        testWallet = Wallet.builder().user(testUser).currency("USD").build();
        testWallet.setId(UUID.randomUUID());

        testProof = PaymentProof.builder()
                .fileUrl("/uploads/payment-proofs/proof1.png")
                .fileType("image/png")
                .fileSize(1024L)
                .originalFilename("receipt.png")
                .build();
        testProof.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should submit deposit request successfully")
    void testSubmitDepositSuccess() {
        DepositCreateRequest request = DepositCreateRequest.builder()
                .amount(new BigDecimal("500.0000"))
                .currency("USD")
                .transactionReference("TXN123456")
                .build();

        MockMultipartFile file = new MockMultipartFile("proof", "receipt.png", "image/png", "fake image data".getBytes());

        when(depositRequestRepository.findByTransactionReference("TXN123456")).thenReturn(Optional.empty());
        when(walletService.getOrCreateWallet(testUser)).thenReturn(testWallet);
        when(paymentProofStorageService.storeProof(file)).thenReturn(testProof);
        when(depositRequestRepository.save(any(DepositRequest.class))).thenAnswer(i -> {
            DepositRequest r = i.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        DepositResponse response = depositService.submitDeposit(testUser, request, file);

        assertNotNull(response);
        assertEquals(DepositStatus.PENDING, response.getStatus());
        assertEquals(new BigDecimal("500.0000"), response.getAmount());
        assertEquals("TXN123456", response.getTransactionReference());
    }

    @Test
    @DisplayName("Should throw DuplicateTransactionException for existing reference")
    void testSubmitDepositDuplicateRef() {
        DepositCreateRequest request = DepositCreateRequest.builder()
                .amount(new BigDecimal("500.0000"))
                .transactionReference("DUP123")
                .build();

        when(depositRequestRepository.findByTransactionReference("DUP123"))
                .thenReturn(Optional.of(DepositRequest.builder().build()));

        MockMultipartFile file = new MockMultipartFile("proof", "receipt.png", "image/png", "data".getBytes());

        assertThrows(DuplicateTransactionException.class, () ->
                depositService.submitDeposit(testUser, request, file));
    }

    @Test
    @DisplayName("Should approve deposit request, credit wallet balance, and record ledger")
    void testApproveDepositSuccess() {
        UUID depositId = UUID.randomUUID();
        DepositRequest pending = DepositRequest.builder()
                .wallet(testWallet)
                .amount(new BigDecimal("1000.0000"))
                .currency("USD")
                .transactionReference("REF999")
                .status(DepositStatus.PENDING)
                .paymentProof(testProof)
                .build();
        pending.setId(depositId);

        WalletBalance balance = WalletBalance.builder()
                .availableBalance(new BigDecimal("1000.0000"))
                .lockedBalance(BigDecimal.ZERO)
                .build();

        when(depositRequestRepository.findById(depositId)).thenReturn(Optional.of(pending));
        when(depositRequestRepository.save(any(DepositRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(walletService.creditAvailableBalance(testWallet, new BigDecimal("1000.0000"))).thenReturn(balance);

        AdminApprovalRequest adminReq = AdminApprovalRequest.builder().adminNotes("Verified bank receipt").build();

        DepositResponse response = depositService.approveDeposit(depositId, adminReq, adminUser);

        assertEquals(DepositStatus.APPROVED, response.getStatus());
        verify(walletService).creditAvailableBalance(testWallet, new BigDecimal("1000.0000"));
        verify(ledgerService).recordEntry(eq(testWallet), eq(new BigDecimal("1000.0000")), eq(LedgerType.CREDIT), eq(new BigDecimal("1000.0000")), any(), eq(depositId));
    }
}
