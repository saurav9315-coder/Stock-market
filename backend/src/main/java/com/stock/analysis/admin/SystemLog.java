package com.stock.analysis.admin;

import com.stock.analysis.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "system_logs")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class SystemLog extends BaseEntity {

    @Column(name = "logger_name", nullable = false, length = 150)
    private String loggerName;

    @Column(name = "level", nullable = false, length = 20)
    private String level; // INFO, WARN, ERROR

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "exception_details", columnDefinition = "TEXT")
    private String exceptionDetails;
}
