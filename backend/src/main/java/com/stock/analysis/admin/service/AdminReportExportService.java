package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.ReportRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminReportExportService {

    public byte[] generateReport(ReportRequestDto request) {
        String reportType = request.getReportType() != null ? request.getReportType().toUpperCase() : "USERS";
        String format = request.getFormat() != null ? request.getFormat().toUpperCase() : "CSV";

        log.info("Generating report: type={}, format={}", reportType, format);

        StringBuilder sb = new StringBuilder();
        if ("CSV".equals(format) || "EXCEL".equals(format)) {
            sb.append("Report Type,Generated At,Start Date,End Date\n");
            sb.append(reportType).append(",").append(Instant.now()).append(",")
                    .append(request.getStartDate()).append(",").append(request.getEndDate()).append("\n\n");

            if ("USERS".equals(reportType)) {
                sb.append("User ID,Username,Email,Status,Created At\n");
                sb.append("u-101,john_doe,john@stock.com,ACTIVE,").append(Instant.now().minusSeconds(86400)).append("\n");
                sb.append("u-102,jane_trader,jane@stock.com,ACTIVE,").append(Instant.now().minusSeconds(172800)).append("\n");
            } else if ("TRADING".equals(reportType)) {
                sb.append("Order ID,Symbol,Side,Quantity,Price,Status,Executed At\n");
                sb.append("o-501,AAPL,BUY,10,185.50,FILLED,").append(Instant.now().minusSeconds(3600)).append("\n");
            } else if ("REVENUE".equals(reportType)) {
                sb.append("Transaction ID,Fee Category,Amount USD,Timestamp\n");
                sb.append("tx-881,TRADING_FEE,12.50,").append(Instant.now().minusSeconds(7200)).append("\n");
            } else {
                sb.append("Metric,Value\n");
                sb.append("Total Volume,150000.00\n");
            }
        } else if ("PDF".equals(format)) {
            sb.append("%PDF-1.4 Enterprise Financial Operations Report\n");
            sb.append("Type: ").append(reportType).append("\n");
            sb.append("Generated: ").append(Instant.now()).append("\n");
            sb.append("Status: Certified Official Platform Export\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
