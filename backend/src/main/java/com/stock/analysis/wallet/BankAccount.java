package com.stock.analysis.wallet;

import com.stock.analysis.common.BaseEntity;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.domain.BankAccountStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "bank_accounts")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class BankAccount extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "routing_number", nullable = false, length = 50)
    private String routingNumber;

    @Column(name = "ifsc_swift", length = 50)
    private String ifscSwift;

    @Column(name = "account_holder_name", nullable = false, length = 100)
    private String accountHolderName;

    @Builder.Default
    @Column(name = "country", length = 50)
    private String country = "IN";

    @Builder.Default
    @Column(name = "currency", length = 10)
    private String currency = "INR";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    private BankAccountStatus verificationStatus = BankAccountStatus.VERIFIED;
}
