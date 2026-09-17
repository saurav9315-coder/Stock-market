package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.AdminApprovalRequest;
import com.stock.analysis.wallet.dto.WithdrawalCreateRequest;
import com.stock.analysis.wallet.dto.WithdrawalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface WithdrawalService {

    WithdrawalResponse submitWithdrawal(User user, WithdrawalCreateRequest request);

    WithdrawalResponse approveWithdrawal(UUID withdrawalId, AdminApprovalRequest request, User admin);

    WithdrawalResponse rejectWithdrawal(UUID withdrawalId, AdminApprovalRequest request, User admin);

    Page<WithdrawalResponse> getPendingWithdrawals(Pageable pageable);

    Page<WithdrawalResponse> getUserWithdrawals(User user, Pageable pageable);
}
