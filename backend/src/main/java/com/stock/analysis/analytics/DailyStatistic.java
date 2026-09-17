package com.stock.analysis.analytics;

import com.stock.analysis.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_statistics")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class DailyStatistic extends BaseEntity {

    @Column(name = "date", nullable = false, unique = true)
    private LocalDate date;

    @Builder.Default
    @Column(name = "active_users", nullable = false)
    private int activeUsers = 0;

    @Builder.Default
    @Column(name = "total_volume", nullable = false, precision = 18, scale = 4)
    private BigDecimal totalVolume = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "new_registrations", nullable = false)
    private int newRegistrations = 0;
}
