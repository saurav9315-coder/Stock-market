package com.stock.analysis.admin.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.analysis.admin.AdminAuditLog;
import com.stock.analysis.admin.repository.AdminAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AdminAuditAspect {

    private final AdminAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Around("@annotation(adminAudited)")
    public Object auditAdminAction(ProceedingJoinPoint joinPoint, AdminAudited adminAudited) throws Throwable {
        String adminUsername = getAdminUsername();
        String ipAddress = getIpAddress();
        String requestId = MDC.get("requestId");
        String url = getRequestUrl();

        Object[] args = joinPoint.getArgs();
        String beforeState = null;
        if (args != null && args.length > 0) {
            try {
                beforeState = objectMapper.writeValueAsString(args);
            } catch (Exception e) {
                log.debug("Failed to serialize method arguments for audit log: {}", e.getMessage());
            }
        }

        Object result = joinPoint.proceed();

        String afterState = null;
        if (result != null) {
            try {
                afterState = objectMapper.writeValueAsString(result);
            } catch (Exception e) {
                log.debug("Failed to serialize method result for audit log: {}", e.getMessage());
            }
        }

        UUID resourceId = null;
        if (args != null) {
            for (Object arg : args) {
                if (arg instanceof UUID) {
                    resourceId = (UUID) arg;
                    break;
                }
            }
        }

        try {
            AdminAuditLog auditLog = AdminAuditLog.builder()
                    .adminUsername(adminUsername != null ? adminUsername : "SYSTEM")
                    .action(adminAudited.action())
                    .resourceName(adminAudited.resourceName())
                    .resourceId(resourceId)
                    .ipAddress(ipAddress)
                    .requestId(requestId)
                    .url(url)
                    .beforeState(beforeState)
                    .afterState(afterState)
                    .createdBy(adminUsername != null ? adminUsername : "SYSTEM")
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Admin audit logged successfully: action={}, resource={}, admin={}", adminAudited.action(), adminAudited.resourceName(), adminUsername);
        } catch (Exception e) {
            log.error("Failed to persist admin audit log: {}", e.getMessage(), e);
        }

        return result;
    }

    private String getAdminUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    private String getIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                return ip;
            }
        } catch (Exception ignored) {
        }
        return "127.0.0.1";
    }

    private String getRequestUrl() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                return attributes.getRequest().getRequestURI();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
