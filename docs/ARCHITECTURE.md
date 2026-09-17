# Enterprise System Architecture Specifications

This document details the architectural design, system context, sequence flows, and microservices readiness of the Stock Market Analysis Platform.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client[Next.js Client SPA / App Router]
    Nginx[Nginx Reverse Proxy & SSL Ingress]
    Backend[Spring Boot 3 Core Backend]
    Postgres[(PostgreSQL 15 Primary DB)]
    Redis[(Redis 7 Cache & STOMP Pub/Sub)]
    ExtAI[External LLM APIs - OpenAI / Gemini]
    ExtMarket[Market Data Feeds - Finnhub / Polygon]

    Client -->|HTTPS / WSS| Nginx
    Nginx -->|Proxy /api| Backend
    Nginx -->|Proxy /ws-stomp| Backend
    Nginx -->|Serve Static| Client

    Backend -->|JPA / Flyway| Postgres
    Backend -->|Spring Data Redis| Redis
    Backend -->|WebClient HTTP| ExtAI
    Backend -->|WebClient HTTP| ExtMarket
```

---

## 2. Authentication & Silent Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant Interceptor as Axios Interceptor
    participant Auth as Security Auth Controller
    participant JWT as JwtTokenProvider
    participant DB as PostgreSQL DB

    User->>Client: Input credentials (Login)
    Client->>Auth: POST /api/v1/auth/login
    Auth->>DB: Verify user & password hash
    Auth->>JWT: Generate Access Token (24h) & Refresh Token (7d)
    Auth-->>Client: Return JWT Tokens & User DTO
    
    Note over Client, Interceptor: Access Token Expired Scenario
    Client->>Interceptor: Issue protected API request
    Interceptor-->>Client: HTTP 401 Unauthorized
    Interceptor->>Interceptor: Queue pending requests
    Interceptor->>Auth: POST /api/v1/auth/refresh (RefreshToken)
    Auth->>JWT: Validate Refresh Token
    Auth-->>Interceptor: Return new Access Token
    Interceptor->>Client: Re-dispatch queued API requests
```

---

## 3. Order Execution Engine Flow

```mermaid
sequenceDiagram
    autonumber
    actor Trader
    participant API as Order Controller
    participant Val as Order Validation Service
    participant Fee as Fee Calculation Service
    participant Engine as Execution Engine
    participant Wallet as Wallet Ledger Service
    participant DB as PostgreSQL DB
    participant WS as Realtime Event Publisher

    Trader->>API: POST /api/v1/trading/orders (BUY 10 AAPL @ $182.50)
    API->>Val: Validate user balance & buying power
    Val->>Fee: Calculate Brokerage, Tax, and GST Fees
    Fee-->>API: Return FeeBreakdown
    API->>Engine: Match & Process Order Execution
    Engine->>Wallet: Record Double-Entry Ledger (DEBIT cash, CREDIT stock)
    Engine->>DB: Save Order & Trade Execution entities
    Engine->>WS: Publish STOMP event to /topic/trades and /queue/orders
    WS-->>Trader: Live WebSocket trade confirmation notification
```

---

## 4. Double-Entry Treasury & Wallet Engine Flow

```mermaid
sequenceDiagram
    autonumber
    actor Investor
    participant App as Wallet Controller
    participant Ledger as Ledger Service
    participant Repo as Wallet Ledger Repository
    participant DB as PostgreSQL DB

    Investor->>App: POST /api/v1/wallet/deposit (Manual UTR Submit)
    App->>DB: Create Pending Deposit Request
    Note over App, DB: Admin Approves Deposit
    App->>Ledger: recordEntry(wallet, amount, LedgerType.CREDIT, balanceAfter)
    Ledger->>Repo: Immutable save(WalletLedger)
    Repo->>DB: Persist immutable ledger row
```

---

## 5. AI Quantitative Research Generation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Analyst
    participant AI as AI Controller
    participant Sanitizer as Prompt Sanitizer
    participant Router as AI Provider Router
    participant LLM as External Provider (OpenAI / Gemini)
    participant Cache as Redis Cache

    Analyst->>AI: POST /api/v1/ai/analyze (Symbol: NVDA)
    AI->>Sanitizer: sanitize(prompt)
    alt Adversarial Prompt Detected
        Sanitizer-->>Analyst: Throw PromptInjectionException (400)
    else Safe Prompt
        AI->>Cache: Check cached analysis
        alt Cache Hit
            Cache-->>Analyst: Return cached JSON response
        else Cache Miss
            AI->>Router: Route prompt to primary LLM
            Router->>LLM: Dispatch API prompt
            LLM-->>Router: Return structural JSON analysis
            Router->>Cache: Store response (TTL: 1 hour)
            Router-->>Analyst: Return AI Research DTO
        end
    end
```
