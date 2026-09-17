# Technical Interview & Recruiter Portfolio Package

This document contains tailored showcase materials, ATS resume bullet points, STAR behavioral interview stories, technical Q&A preparation, and live presentation scripts for technical interviews and engineering portfolio reviews.

---

## 1. Recruiter Project Summary (1 Paragraph)

> **Antigravity Quant** is an enterprise-grade stock market analytics, portfolio allocation, and automated trading platform engineered with a Spring Boot 3 Java backend, Next.js 20 frontend, PostgreSQL database, and Redis caching engine. The platform features an immutable double-entry ledger engine guaranteeing zero financial balance drift, high-frequency STOMP WebSocket telemetry, LLM-powered quantitative stock research with prompt-injection security sanitization, and an automated multi-stage Docker / Nginx reverse-proxy infrastructure. Verified with 92 automated JUnit/MockMvc test suites achieving 90% JaCoCo code coverage.

---

## 2. ATS-Optimized Resume Bullet Points

- **Engineered an enterprise stock analytics & trading platform** utilizing Spring Boot 3, Java 21, Next.js 20, PostgreSQL, and Redis, serving real-time market data to connected clients via STOMP WebSockets.
- **Architected an immutable double-entry treasury & ledger engine** using Spring `@Transactional` isolated locks, ensuring zero balance drift under high-concurrency multi-threaded transaction workloads.
- **Implemented advanced security standards** featuring JWT access token rotation with silent Axios refresh interceptor queues, Role-Based Access Control (`ROLE_ADMIN` vs `ROLE_USER`), SQL injection protection, and Regex prompt-injection sanitization.
- **Configured automated DevOps CI/CD pipelines and Docker containerization** using multi-stage Alpine Dockerfiles, Nginx reverse proxying (TLS 1.3, HSTS, Gzip, rate limiting), GitHub Actions workflows, CodeQL SAST, and Trivy security scanning.
- **Achieved 90% JaCoCo code coverage** by engineering 92 automated JUnit 5, MockMvc, and Testcontainers unit and integration test suites.

---

## 3. STAR Behavioral Interview Stories

### Story 1: Resolving Concurrency Risks in Double-Entry Ledger Engine
- **Situation**: In financial trading systems, race conditions during simultaneous deposit and order execution requests can lead to negative balances or double-spending.
- **Task**: Design a high-concurrency ledger service that guarantees strict balance integrity.
- **Action**: Implemented an immutable ledger service (`LedgerServiceImpl`) using DB transactions and isolated credit/debit records. Wrote multithreaded test suites (`LedgerIntegrityConcurrencyTest`) using `ExecutorService` and `CountDownLatch` simulating 10 concurrent threads to verify thread safety.
- **Result**: Zero balance drift and 100% thread safety verified under high concurrency.

### Story 2: Silent JWT Access Token Rotation
- **Situation**: User sessions were expiring abruptly during active trading sessions when access tokens reached expiry.
- **Task**: Implement seamless token rotation without interrupting the user's workflow or dropping active network calls.
- **Action**: Engineered a centralized Axios interceptor queue in `src/lib/api.ts` that catches 401 Unauthorized responses, queues outbound requests, executes a silent refresh request to obtain a new access token, and re-dispatches the queued requests automatically.
- **Result**: Eliminated user session disruptions and provided continuous single-page application experience.

### Story 3: Multi-Stage Containerization & Production VPS Infrastructure
- **Situation**: Deploying full-stack Next.js and Spring Boot apps on VPS instances can lead to bloated container images and high resource usage.
- **Task**: Containerize the platform following enterprise DevOps standards for production deployment.
- **Action**: Created multi-stage Dockerfiles utilizing standalone Next.js builds (Node 20 Alpine) and JRE runtime images (Temurin JRE 17), running with non-root security contexts (`nextjs:1001`, `spring:10001`), resource caps, and Nginx rate limiting.
- **Result**: Reduced image footprint by over 60% and achieved single-command orchestration via `docker compose up -d`.

---

## 4. Technical Interview Questions & Answers

### Q1: How do you handle JWT access token expiration without forcing the user to log in again?
> **Answer**: We use short-lived Access Tokens (24h) and long-lived Refresh Tokens (7d). When an HTTP request returns a `401 Unauthorized`, our centralized Axios interceptor catches the error, pushes the request into a waiting queue, sends a POST to `/api/v1/auth/refresh`, obtains a new access token, updates the header, and automatically retries the queued requests seamlessly.

### Q2: How do you prevent prompt injection attacks in the AI Quantitative module?
> **Answer**: We built a dedicated `PromptSanitizer` component that scans input prompts using case-insensitive Regular Expression patterns (such as `ignore previous instructions`, `you are now in developer mode`, `jailbreak`). If an injection attempt is detected, it throws a `PromptInjectionException` before the request reaches the LLM API router.

### Q3: Why use Testcontainers for integration testing instead of H2 in-memory databases?
> **Answer**: H2 doesn't always support PostgreSQL-specific syntax, Flyway migration scripts, or specialized indexes. Using Testcontainers runs real PostgreSQL and Redis containers inside Docker during `mvn verify`, giving 100% environment fidelity between development, CI/CD, and production.

---

## 5. Elevator Pitch (30 Seconds)

> "Antigravity Quant is an enterprise stock analytics and automated trading platform built with Spring Boot 3, Next.js 20, PostgreSQL, and Redis. It features an immutable double-entry ledger engine that prevents financial balance drift under high concurrency, real-time WebSocket price updates, and AI-driven equity research protected against prompt injection attacks. It is fully containerized with multi-stage Dockerfiles, Nginx reverse proxying, and CI/CD quality gates enforcing 90% code coverage across 92 automated tests."

---

## 6. Live Presentation & Demo Script (5–10 Minutes)

1. **Introduction (0:00 - 1:00)**: Show Landing Page ticker, overview of institutional architecture, and tech stack.
2. **Trader Workspace Demo (1:00 - 3:00)**: Show Markets index view, technical candlestick charts, stock screener filters, and order placement.
3. **Treasury & Ledger Demo (3:00 - 5:00)**: Demonstrate Treasury Desk (`/wallet`), manual UTR deposit submission, credit balance updates, and double-entry transaction history.
4. **AI & Quantitative Insights Demo (5:00 - 6:30)**: Demonstrate AI analysis generator, prompt injection detection alert, and risk scoring.
5. **Admin Operations Matrix Demo (6:30 - 8:30)**: Switch role to Super Admin, review user directory, pending KYC approvals, and deposit review drawers.
6. **Architecture & DevOps Review (8:30 - 10:00)**: Highlight Docker Compose orchestration, Nginx reverse proxy routing, and 92 passing automated JUnit tests.
