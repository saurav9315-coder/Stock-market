package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.BankAccount;
import com.stock.analysis.wallet.domain.BankAccountStatus;
import com.stock.analysis.wallet.dto.BankAccountCreateRequest;
import com.stock.analysis.wallet.dto.BankAccountResponse;
import com.stock.analysis.wallet.exception.WalletException;
import com.stock.analysis.wallet.repository.BankAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankAccountServiceImpl implements BankAccountService {

    private final BankAccountRepository bankAccountRepository;

    @Transactional
    @Override
    public BankAccountResponse addBankAccount(User user, BankAccountCreateRequest request) {
        log.info("Adding bank account for user: {}", user.getUsername());

        BankAccount account = BankAccount.builder()
                .user(user)
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .accountHolderName(request.getAccountHolderName())
                .ifscSwift(request.getIfscOrSwift())
                .routingNumber(request.getRoutingNumber() != null ? request.getRoutingNumber() : request.getIfscOrSwift())
                .country(request.getCountry() != null ? request.getCountry() : "IN")
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .verificationStatus(BankAccountStatus.VERIFIED)
                .createdBy(user.getUsername())
                .build();

        account = bankAccountRepository.save(account);
        return mapToResponse(account);
    }

    @Transactional(readOnly = true)
    @Override
    public List<BankAccountResponse> getUserBankAccounts(User user) {
        return bankAccountRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void deleteBankAccount(User user, UUID id) {
        BankAccount account = bankAccountRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new WalletException("Bank account not found or access denied"));
        bankAccountRepository.delete(account);
        log.info("Deleted bank account ID: {} for user: {}", id, user.getUsername());
    }

    private BankAccountResponse mapToResponse(BankAccount account) {
        String accNum = account.getAccountNumber();
        String masked = (accNum != null && accNum.length() > 4) 
                ? "****" + accNum.substring(accNum.length() - 4) 
                : accNum;

        return BankAccountResponse.builder()
                .id(account.getId())
                .bankName(account.getBankName())
                .maskedAccountNumber(masked)
                .accountHolderName(account.getAccountHolderName())
                .ifscOrSwift(account.getIfscSwift())
                .routingNumber(account.getRoutingNumber())
                .country(account.getCountry())
                .currency(account.getCurrency())
                .verificationStatus(account.getVerificationStatus())
                .build();
    }
}
