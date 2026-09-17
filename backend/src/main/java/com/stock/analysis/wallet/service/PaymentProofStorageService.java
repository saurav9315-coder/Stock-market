package com.stock.analysis.wallet.service;

import com.stock.analysis.wallet.PaymentProof;
import org.springframework.web.multipart.MultipartFile;

public interface PaymentProofStorageService {
    PaymentProof storeProof(MultipartFile file);
}
