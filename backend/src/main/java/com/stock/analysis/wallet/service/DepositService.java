package com.stock.analysis.wallet.service;

import com.stock.analysis.users.User;
import com.stock.analysis.wallet.dto.AdminApprovalRequest;
import com.stock.analysis.wallet.dto.DepositCreateRequest;
import com.stock.analysis.wallet.dto.DepositResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface DepositService {

    DepositResponse submitDeposit(User user, DepositCreateRequest request, MultipartFile proofFile);

    DepositResponse approveDeposit(UUID depositId, AdminApprovalRequest request, User admin);

    DepositResponse rejectDeposit(UUID depositId, AdminApprovalRequest request, User admin);

    Page<DepositResponse> getPendingDeposits(Pageable pageable);

    Page<DepositResponse> getUserDeposits(User user, Pageable pageable);
}
