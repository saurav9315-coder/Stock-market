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

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class SystemSetting extends BaseEntity {

    @Column(name = "setting_key", unique = true, nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
    private String settingValue;

    @Builder.Default
    @Column(name = "category", nullable = false, length = 50)
    private String category = "GENERAL";

    @Column(name = "description", length = 255)
    private String description;

    @Builder.Default
    @Column(name = "data_type", nullable = false, length = 20)
    private String dataType = "STRING"; // STRING, NUMBER, BOOLEAN, JSON

    @Builder.Default
    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;
}
