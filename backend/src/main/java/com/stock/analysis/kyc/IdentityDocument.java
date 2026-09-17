package com.stock.analysis.kyc;

import com.stock.analysis.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "identity_documents")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class IdentityDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kyc_request_id", nullable = false)
    private KycRequest kycRequest;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // PASSPORT, DRIVERS_LICENSE, NATIONAL_ID

    @Column(name = "document_number", nullable = false, length = 100)
    private String documentNumber;

    @Column(name = "document_front_url", nullable = false)
    private String documentFrontUrl;

    @Column(name = "document_back_url")
    private String documentBackUrl;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;
}
