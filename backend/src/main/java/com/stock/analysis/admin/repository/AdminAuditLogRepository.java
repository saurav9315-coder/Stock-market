package com.stock.analysis.admin.repository;

import com.stock.analysis.admin.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, UUID>, JpaSpecificationExecutor<AdminAuditLog> {

    Page<AdminAuditLog> findByAction(String action, Pageable pageable);

    Page<AdminAuditLog> findByAdminUsername(String adminUsername, Pageable pageable);
}
