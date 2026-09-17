package com.stock.analysis.wallet.service;

import com.stock.analysis.wallet.PaymentProof;
import com.stock.analysis.wallet.exception.WalletException;
import com.stock.analysis.wallet.repository.PaymentProofRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentProofStorageServiceImpl implements PaymentProofStorageService {

    private final PaymentProofRepository paymentProofRepository;
    private final Path storageDirectory = Paths.get("uploads", "payment-proofs");

    @Override
    public PaymentProof storeProof(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new WalletException("Payment proof file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            throw new WalletException("Invalid file type. Only Image (PNG, JPG) and PDF files are allowed");
        }

        try {
            if (!Files.exists(storageDirectory)) {
                Files.createDirectories(storageDirectory);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String storedFileName = UUID.randomUUID() + extension;
            Path targetLocation = storageDirectory.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            PaymentProof proof = PaymentProof.builder()
                    .fileUrl("/uploads/payment-proofs/" + storedFileName)
                    .fileType(contentType)
                    .fileSize(file.getSize())
                    .originalFilename(originalFilename != null ? originalFilename : storedFileName)
                    .createdBy("SYSTEM")
                    .build();

            return paymentProofRepository.save(proof);
        } catch (IOException e) {
            log.error("Failed to store payment proof file", e);
            throw new WalletException("Failed to store payment proof file: " + e.getMessage(), e);
        }
    }
}
