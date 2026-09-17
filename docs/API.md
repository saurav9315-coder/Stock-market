# OpenAPI & REST API Reference Specifications

This document outlines the REST API endpoints, Swagger UI documentation, authentication header conventions, and response DTO schemas.

---

## 1. Interactive OpenAPI 3 / Swagger Interface

When running locally or in production:
- **Swagger UI Workspace**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON Schema**: `http://localhost:8080/v3/api-docs`

---

## 2. API Endpoint Matrix

### Authentication Endpoints (`/api/v1/auth`)

| HTTP Method | Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user account. |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT tokens. |
| `POST` | `/api/v1/auth/refresh` | Public | Rotate expired access token using valid refresh token. |
| `POST` | `/api/v1/auth/logout` | Authenticated | Blacklist token & invalidate session. |

### Trading Engine Endpoints (`/api/v1/trading`)

| HTTP Method | Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/trading/orders` | Authenticated | Get user orders with pagination. |
| `POST` | `/api/v1/trading/orders` | Authenticated | Place new stock market or limit order. |
| `POST` | `/api/v1/trading/orders/{id}/cancel` | Authenticated | Cancel pending order. |

### Treasury & Wallet Endpoints (`/api/v1/wallet`)

| HTTP Method | Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/wallet/balance` | Authenticated | Get current wallet available & locked balance. |
| `POST` | `/api/v1/wallet/deposit` | Authenticated | Submit manual UTR deposit request. |
| `POST` | `/api/v1/wallet/withdraw` | Authenticated | Submit cash withdrawal request. |
| `GET` | `/api/v1/wallet/ledger` | Authenticated | Retrieve immutable double-entry ledger history. |

### Admin Operations Endpoints (`/api/v1/admin`)

| HTTP Method | Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard` | `ROLE_ADMIN` | Get system overview analytics. |
| `GET` | `/api/v1/admin/wallet/deposits` | `ROLE_ADMIN` | Get pending deposit requests. |
| `POST` | `/api/v1/admin/wallet/deposits/{id}/approve` | `ROLE_ADMIN` | Approve pending deposit and credit user wallet. |
