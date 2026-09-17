package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.BankAccountCreateRequest;
import com.stock.analysis.wallet.dto.BankAccountResponse;

import java.util.List;
import java.util.UUID;

public interface BankAccountService {

    BankAccountResponse addBankAccount(User user, BankAccountCreateRequest request);

    List<BankAccountResponse> getUserBankAccounts(User user);

    void deleteBankAccount(User user, UUID id);
}
