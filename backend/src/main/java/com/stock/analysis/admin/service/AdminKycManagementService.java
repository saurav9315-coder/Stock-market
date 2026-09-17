package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.KycManagementDtos.*;
import com.stock.analysis.exception.ResourceNotFoundException;
import com.stock.analysis.kyc.KycRequest;
import com.stock.analysis.kyc.KycRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminKycManagementService {

    private final KycRequestRepository kycRequestRepository;

    @Transactional(readOnly = true)
    public Page<KycSummaryDto> getKycRequests(String status, Pageable pageable) {
        Page<KycRequest> requests;
        if (status != null && !status.isBlank()) {
            requests = kycRequestRepository.findByStatus(status, pageable);
        } else {
            requests = kycRequestRepository.findAll(pageable);
        }

        return requests.map(req -> KycSummaryDto.builder()
                .id(req.getId())
                .userId(req.getUser().getId())
                .username(req.getUser().getUsername())
                .email(req.getUser().getEmail())
                .kycLevel("LEVEL_2_STANDARD")
                .status(req.getStatus())
                .submittedAt(req.getSubmittedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public KycDetailDto getKycDetail(UUID requestId) {
        KycRequest req = kycRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC Request not found: " + requestId));

        return KycDetailDto.builder()
                .id(req.getId())
                .userId(req.getUser().getId())
                .username(req.getUser().getUsername())
                .email(req.getUser().getEmail())
                .fullName(req.getUser().getUsername())
                .idType("NATIONAL_ID")
                .idNumber("ID-992019283")
                .documentFrontUrl("https://storage.stock.com/kyc/docs/front_sample.jpg")
                .documentBackUrl("https://storage.stock.com/kyc/docs/back_sample.jpg")
                .selfieUrl("https://storage.stock.com/kyc/docs/selfie_sample.jpg")
                .addressProofUrl("https://storage.stock.com/kyc/docs/utility_bill.pdf")
                .status(req.getStatus())
                .rejectionReason(req.getRejectionReason())
                .submittedAt(req.getSubmittedAt())
                .history(List.of())
                .build();
    }

    @Transactional
    public void processKycAction(UUID requestId, KycActionRequest request) {
        KycRequest req = kycRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC Request not found: " + requestId));

        String action = request.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            req.setStatus("APPROVED");
            req.setRejectionReason(null);
        } else if ("REJECT".equals(action)) {
            req.setStatus("REJECTED");
            req.setRejectionReason(request.getReason());
        } else if ("REQUEST_DOCUMENTS".equals(action)) {
            req.setStatus("ACTION_REQUIRED");
            req.setRejectionReason("Additional Documents Requested: " + request.getReason());
        }
        req.setReviewedAt(Instant.now());
        kycRequestRepository.save(req);
        log.info("Admin processed KYC request {}: action={}", requestId, action);
    }
}
