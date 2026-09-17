package com.stock.analysis.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@stockanalysis.com}")
    private String fromEmail;

    @Async
    public void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> templateModel) {
        log.info("Preparing HTML Email for {}: Subject='{}', Template='{}'", to, subject, templateName);
        try {
            Context context = new Context();
            if (templateModel != null) {
                context.setVariables(templateModel);
            }

            String htmlContent = templateEngine.process("email/" + templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Successfully dispatched email to {}", to);

        } catch (Exception e) {
            log.warn("Failed to send email to {} via JavaMailSender (Fallback log mode): {}", to, e.getMessage());
            log.debug("Email Dispatch Error Details:", e);
        }
    }
}
