package com.stock.analysis.trading.repository;

import com.stock.analysis.trading.entity.OrderAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderAuditLogRepository extends JpaRepository<OrderAuditLog, UUID> {

    List<OrderAuditLog> findByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
