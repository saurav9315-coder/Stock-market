# Database Architecture & Entity Specifications

This document outlines the relational database design, ER diagram, indexing strategy, and soft-delete conventions for the Stock Market Analysis Platform.

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ WALLETS : owns
    USERS ||--o{ ORDERS : places
    USERS ||--o{ KYC_REQUESTS : submits
    USERS ||--o{ NOTIFICATIONS : receives
    WALLETS ||--o{ WALLET_LEDGERS : records
    STOCKS ||--o{ ORDERS : target
    ORDERS ||--o{ TRADE_EXECUTIONS : generates
    USERS ||--o{ AI_ANALYSIS_HISTORIES : requests

    USERS {
        uuid id PK
        string username UK
        string email UK
        string password
        boolean enabled
        timestamp created_at
    }

    WALLETS {
        uuid id PK
        uuid user_id FK
        string currency
        timestamp created_at
    }

    WALLET_LEDGERS {
        uuid id PK
        uuid wallet_id FK
        decimal amount
        string type
        decimal balance_after
        uuid reference_id
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid stock_id FK
        string side
        string order_type
        decimal quantity
        decimal limit_price
        string status
        timestamp created_at
    }

    TRADE_EXECUTIONS {
        uuid id PK
        uuid order_id FK
        uuid stock_id FK
        decimal price
        decimal quantity
        timestamp executed_at
    }
```

---

## 2. Table Specifications & Foreign Keys

### Users Table (`users`)
- Primary Key: `id` (UUID)
- Unique Constraints: `username`, `email`
- Soft Delete Filter: `@SQLRestriction("deleted_at IS NULL")`

### Wallet Ledgers Table (`wallet_ledgers`)
- Primary Key: `id` (UUID)
- Foreign Key: `wallet_id` -> `wallets(id)`
- Fields: `amount`, `type` (`CREDIT` / `DEBIT`), `balance_after`, `description`, `reference_id`

---

## 3. High-Throughput Indexing Strategy

To maintain low latency for financial queries:
- `idx_users_email_username`: Composite index on `users(email, username)` for fast authentication lookups.
- `idx_wallet_ledgers_wallet_created`: Composite index on `wallet_ledgers(wallet_id, created_at DESC)` for instantaneous historical transaction rendering.
- `idx_orders_user_status`: Index on `orders(user_id, status)` for user active order management.
