package com.stock.analysis.admin.domain;

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

import java.time.Instant;

@Entity
@Table(name = "announcements")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class Announcement extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(name = "type", nullable = false, length = 30)
    private String type = "ANNOUNCEMENT"; // ANNOUNCEMENT, MAINTENANCE, EMERGENCY, MARKETING

    @Builder.Default
    @Column(name = "target_audience", nullable = false, length = 30)
    private String targetAudience = "ALL"; // ALL, VERIFIED_USERS, TRADERS

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "broadcast_at")
    private Instant broadcastAt;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, SCHEDULED, BROADCASTED, CANCELLED

    @Builder.Default
    @Column(name = "broadcast_channel", nullable = false, length = 30)
    private String broadcastChannel = "IN_APP"; // IN_APP, EMAIL, ALL
}
