package com.stock.analysis.admin.controller;

import com.stock.analysis.admin.audit.AdminAudited;
import com.stock.analysis.admin.dto.ReportRequestDto;
import com.stock.analysis.admin.service.AdminReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminReportController {

    private final AdminReportExportService reportExportService;

    @PostMapping("/generate")
    @AdminAudited(action = "GENERATE_REPORT", resourceName = "REPORT")
    public ResponseEntity<byte[]> generateReport(@RequestBody ReportRequestDto request) {
        byte[] content = reportExportService.generateReport(request);

        String format = request.getFormat() != null ? request.getFormat().toLowerCase() : "csv";
        String filename = "report_" + request.getReportType() + "_" + System.currentTimeMillis() + "." + (format.equals("excel") ? "csv" : format);

        MediaType mediaType = "pdf".equalsIgnoreCase(format) ? MediaType.APPLICATION_PDF : MediaType.parseMediaType("text/csv");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(content);
    }
}
