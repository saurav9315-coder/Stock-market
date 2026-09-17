-- V3__enterprise_database_design.sql
-- Production-ready PostgreSQL database architecture for Stock Market Analysis Platform

-- =========================================================================
-- 1. EXTENSIONS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================================================
-- 2. ALTER EXISTING TABLES (For Auditing & Soft Delete standards)
-- =========================================================================

-- Add deleted_at to users and drop old unique constraints to replace with partial unique indexes
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

CREATE UNIQUE INDEX idx_users_username_active ON users(username) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_email_active ON users(email) WHERE deleted_at IS NULL;

-- Add deleted_at to refresh_tokens and recreate indexes
ALTER TABLE refresh_tokens ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
DROP INDEX IF EXISTS idx_refresh_tokens_token;
CREATE UNIQUE INDEX idx_refresh_tokens_token_active ON refresh_tokens(token) WHERE deleted_at IS NULL;

-- Add standard fields to password_histories (V2 was missing them)
ALTER TABLE password_histories ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE password_histories ADD COLUMN updated_by VARCHAR(100);
ALTER TABLE password_histories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE password_histories ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE password_histories ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Add standard fields to verification_tokens
ALTER TABLE verification_tokens ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE verification_tokens ADD COLUMN updated_by VARCHAR(100);
ALTER TABLE verification_tokens ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE verification_tokens ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE verification_tokens ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Add standard fields to password_reset_tokens
ALTER TABLE password_reset_tokens ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE password_reset_tokens ADD COLUMN updated_by VARCHAR(100);
ALTER TABLE password_reset_tokens ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE password_reset_tokens ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE password_reset_tokens ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;


-- =========================================================================
-- 3. SECURITY & ROLE SCHEMAS
-- =========================================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_role_permissions UNIQUE (role_id, permission_id)
);

-- =========================================================================
-- 4. SEED & MIGRATE SECURITY CONFIG
-- =========================================================================

-- Seed Roles
INSERT INTO roles (id, name, created_at, created_by) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ROLE_GUEST', NOW(), 'SYSTEM'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ROLE_USER', NOW(), 'SYSTEM'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ROLE_VERIFIED_USER', NOW(), 'SYSTEM'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'ROLE_ADMIN', NOW(), 'SYSTEM'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'ROLE_SUPER_ADMIN', NOW(), 'SYSTEM')
ON CONFLICT (name) DO NOTHING;

-- Seed Permissions
INSERT INTO permissions (id, name, created_at, created_by) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'USER_READ', NOW(), 'SYSTEM'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'USER_WRITE', NOW(), 'SYSTEM'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'PORTFOLIO_READ', NOW(), 'SYSTEM'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'PORTFOLIO_WRITE', NOW(), 'SYSTEM'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'WALLET_READ', NOW(), 'SYSTEM'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'WALLET_WRITE', NOW(), 'SYSTEM'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'ADMIN_READ', NOW(), 'SYSTEM'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'ADMIN_WRITE', NOW(), 'SYSTEM')
ON CONFLICT (name) DO NOTHING;

-- Map ROLE_USER permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at, created_by) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', NOW(), 'SYSTEM')
ON CONFLICT DO NOTHING;

-- Map ROLE_VERIFIED_USER permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at, created_by) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', NOW(), 'SYSTEM')
ON CONFLICT DO NOTHING;

-- Map ROLE_ADMIN permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at, created_by) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', NOW(), 'SYSTEM')
ON CONFLICT DO NOTHING;

-- Map ROLE_SUPER_ADMIN permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_at, created_by) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', NOW(), 'SYSTEM'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', NOW(), 'SYSTEM')
ON CONFLICT DO NOTHING;

-- Populate user_roles join table from existing users.roles column data
INSERT INTO user_roles (id, user_id, role_id, created_at, created_by)
SELECT 
    gen_random_uuid(), 
    u.id, 
    r.id, 
    NOW(), 
    'SYSTEM'
FROM users u
JOIN roles r ON r.name = ANY(string_to_array(u.roles, ','))
ON CONFLICT DO NOTHING;

-- Safely drop old user roles column
ALTER TABLE users DROP COLUMN roles;


-- =========================================================================
-- 5. SESSIONS & HISTORY SCHEMAS
-- =========================================================================

CREATE TABLE login_histories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45) NOT NULL,
    device_info VARCHAR(255),
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED
    failure_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    device_info VARCHAR(255),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 6. PROFILE & KYC SCHEMAS
-- =========================================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) NOT NULL DEFAULT 'DARK', -- LIGHT, DARK
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE notification_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    price_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    news_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE security_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    two_factor_type VARCHAR(20) DEFAULT 'TOTP', -- TOTP, SMS, EMAIL
    biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE devices (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(255) NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL, -- IOS, ANDROID, WEB
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE kyc_requests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reviewer_id UUID, -- References Admin/System Users when we add admin table
    rejection_reason VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE identity_documents (
    id UUID PRIMARY KEY,
    kyc_request_id UUID NOT NULL REFERENCES kyc_requests(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- PASSPORT, DRIVERS_LICENSE, NATIONAL_ID
    document_number VARCHAR(100) NOT NULL,
    document_front_url VARCHAR(255) NOT NULL,
    document_back_url VARCHAR(255),
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE address_verifications (
    id UUID PRIMARY KEY,
    kyc_request_id UUID NOT NULL REFERENCES kyc_requests(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- UTILITY_BILL, BANK_STATEMENT, GOVERNMENT_LETTER
    document_url VARCHAR(255) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE kyc_verification_histories (
    id UUID PRIMARY KEY,
    kyc_request_id UUID NOT NULL REFERENCES kyc_requests(id) ON DELETE CASCADE,
    status_from VARCHAR(20),
    status_to VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 7. WALLET & FINANCIAL SCHEMAS
-- =========================================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE wallet_balances (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL UNIQUE REFERENCES wallets(id) ON DELETE RESTRICT,
    available_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    locked_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE wallet_ledgers (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    amount NUMERIC(18, 4) NOT NULL,
    type VARCHAR(10) NOT NULL, -- DEBIT, CREDIT
    balance_after NUMERIC(18, 4) NOT NULL,
    description VARCHAR(255),
    reference_id UUID, -- References order, deposit, or withdrawal
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    routing_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE payment_proofs (
    id UUID PRIMARY KEY,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE deposit_requests (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    amount NUMERIC(18, 4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    payment_proof_id UUID REFERENCES payment_proofs(id) ON DELETE SET NULL,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    amount NUMERIC(18, 4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE transaction_histories (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL, TRADE_BUY, TRADE_SELL, FEE
    amount NUMERIC(18, 4) NOT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, COMPLETED, FAILED, CANCELLED
    fee NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    reference_type VARCHAR(50), -- DEPOSIT_REQUEST, WITHDRAWAL_REQUEST, ORDER
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 8. STOCK MARKET SCHEMAS
-- =========================================================================

CREATE TABLE exchanges (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE, -- NYSE, NASDAQ, LSE
    country VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE stocks (
    id UUID PRIMARY KEY,
    exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE RESTRICT,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_stocks_symbol UNIQUE (symbol)
);

CREATE TABLE stock_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE stock_category_mappings (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES stock_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_stock_category_mappings UNIQUE (stock_id, category_id)
);

CREATE TABLE market_indices (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL UNIQUE, -- .DJI, .SPX, .IXIC
    value NUMERIC(18, 4) NOT NULL,
    change_amount NUMERIC(18, 4) NOT NULL,
    change_percent NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE company_profiles (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL UNIQUE REFERENCES stocks(id) ON DELETE CASCADE,
    ceo VARCHAR(100),
    sector VARCHAR(100),
    industry VARCHAR(100),
    description TEXT,
    website VARCHAR(255),
    market_cap BIGINT,
    pe_ratio NUMERIC(10, 2),
    dividend_yield NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Partitioned Table for Historical Prices
CREATE TABLE historical_prices (
    id UUID NOT NULL,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    open_price NUMERIC(18, 4) NOT NULL,
    high_price NUMERIC(18, 4) NOT NULL,
    low_price NUMERIC(18, 4) NOT NULL,
    close_price NUMERIC(18, 4) NOT NULL,
    volume BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Default catch-all partition
CREATE TABLE historical_prices_default PARTITION OF historical_prices DEFAULT;

-- Live Prices Cache (UNLOGGED table for high write/read speed)
CREATE UNLOGGED TABLE live_prices_cache (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL UNIQUE REFERENCES stocks(id) ON DELETE CASCADE,
    price NUMERIC(18, 4) NOT NULL,
    change_amount NUMERIC(18, 4) NOT NULL,
    change_percent NUMERIC(5, 2) NOT NULL,
    bid_price NUMERIC(18, 4),
    ask_price NUMERIC(18, 4),
    volume BIGINT NOT NULL,
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 9. PORTFOLIO & ORDERS SCHEMAS
-- =========================================================================

CREATE TABLE portfolios (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE holdings (
    id UUID PRIMARY KEY,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    quantity NUMERIC(18, 6) NOT NULL DEFAULT 0.000000,
    average_buy_price NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_holdings UNIQUE (portfolio_id, stock_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE RESTRICT,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    type VARCHAR(10) NOT NULL, -- BUY, SELL
    order_type VARCHAR(20) NOT NULL, -- LIMIT, MARKET, STOP_LIMIT
    status VARCHAR(20) NOT NULL, -- PENDING, FILLED, PARTIALLY_FILLED, CANCELLED, REJECTED
    quantity NUMERIC(18, 6) NOT NULL,
    filled_quantity NUMERIC(18, 6) NOT NULL DEFAULT 0.000000,
    limit_price NUMERIC(18, 4),
    stop_price NUMERIC(18, 4),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE buy_orders (
    id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    max_buy_price NUMERIC(18, 4),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sell_orders (
    id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    min_sell_price NUMERIC(18, 4),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE trade_histories (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE RESTRICT,
    quantity NUMERIC(18, 6) NOT NULL,
    price NUMERIC(18, 4) NOT NULL,
    execution_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fee NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE profit_losses (
    id UUID PRIMARY KEY,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    realized_pl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    unrealized_pl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_profit_losses UNIQUE (portfolio_id, stock_id)
);


-- =========================================================================
-- 10. WATCHLIST SCHEMAS
-- =========================================================================

CREATE TABLE watchlists (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_watchlists UNIQUE (user_id, name)
);

CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY,
    watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_watchlist_items UNIQUE (watchlist_id, stock_id)
);


-- =========================================================================
-- 11. NEWS SCHEMAS
-- =========================================================================

CREATE TABLE news_articles (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment VARCHAR(20), -- BULLISH, BEARISH, NEUTRAL
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE news_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE news_category_mappings (
    id UUID PRIMARY KEY,
    news_article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_news_category_mappings UNIQUE (news_article_id, category_id)
);

CREATE TABLE news_bookmarks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_news_bookmarks UNIQUE (user_id, news_article_id)
);

CREATE TABLE news_ai_summaries (
    id UUID PRIMARY KEY,
    news_article_id UUID NOT NULL UNIQUE REFERENCES news_articles(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    bullet_points JSONB,
    sentiment_score NUMERIC(3, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 12. AI SCHEMAS
-- =========================================================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- USER, ASSISTANT
    content TEXT NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ai_analysis_histories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- STOCK, PORTFOLIO, MARKET
    input_data JSONB NOT NULL,
    result TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE prompt_histories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_template_name VARCHAR(100) NOT NULL,
    filled_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 13. ALERTS SCHEMAS
-- =========================================================================

CREATE TABLE price_alerts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    target_price NUMERIC(18, 4) NOT NULL,
    condition VARCHAR(10) NOT NULL, -- ABOVE, BELOW
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE notification_histories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- EMAIL, PUSH, SMS
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_alerts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- PRICE, SYSTEM, NEWS
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 14. ADMIN & SYSTEM SCHEMAS
-- =========================================================================

CREATE TABLE admin_users (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- SUPPORT, COMPLIANCE, SUPER_ADMIN
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Partitioned Table for Activity Logs
CREATE TABLE user_activity_logs (
    id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Default catch-all partition
CREATE TABLE user_activity_logs_default PARTITION OF user_activity_logs DEFAULT;

CREATE TABLE system_logs (
    id UUID PRIMARY KEY,
    logger_name VARCHAR(150) NOT NULL,
    level VARCHAR(20) NOT NULL, -- INFO, WARN, ERROR
    message TEXT NOT NULL,
    exception_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subject VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 15. ANALYTICS SCHEMAS
-- =========================================================================

CREATE TABLE daily_statistics (
    id UUID PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    active_users INTEGER NOT NULL DEFAULT 0,
    total_volume NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    new_registrations INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE portfolio_analytics (
    id UUID PRIMARY KEY,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value NUMERIC(18, 4) NOT NULL,
    daily_return NUMERIC(18, 4) NOT NULL,
    cumulative_return NUMERIC(18, 4) NOT NULL,
    sharpe_ratio NUMERIC(6, 4),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_portfolio_analytics UNIQUE (portfolio_id, date)
);

CREATE TABLE market_analytics (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    high_52w NUMERIC(18, 4),
    low_52w NUMERIC(18, 4),
    moving_avg_50d NUMERIC(18, 4),
    moving_avg_200d NUMERIC(18, 4),
    beta NUMERIC(6, 4),
    rsi NUMERIC(6, 3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_market_analytics UNIQUE (stock_id, date)
);

CREATE TABLE revenue_analytics (
    id UUID PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    trading_fees NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    subscription_revenue NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    other_revenue NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- 16. INDEX STRATEGIES (For High-Performance O(1) & Range lookups)
-- =========================================================================

-- Sessions & History
CREATE INDEX idx_login_histories_user ON login_histories(user_id);
CREATE INDEX idx_login_histories_created ON login_histories(created_at DESC);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);

-- KYC Indices
CREATE INDEX idx_kyc_requests_user ON kyc_requests(user_id);
CREATE INDEX idx_kyc_requests_status ON kyc_requests(status);
CREATE INDEX idx_identity_docs_kyc ON identity_documents(kyc_request_id);
CREATE INDEX idx_address_verif_kyc ON address_verifications(kyc_request_id);

-- Wallet & Financial Indices
CREATE INDEX idx_wallet_ledgers_wallet ON wallet_ledgers(wallet_id);
CREATE INDEX idx_wallet_ledgers_created ON wallet_ledgers(created_at DESC);
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_deposit_requests_wallet ON deposit_requests(wallet_id);
CREATE INDEX idx_withdrawal_requests_wallet ON withdrawal_requests(wallet_id);
CREATE INDEX idx_transaction_histories_wallet ON transaction_histories(wallet_id);
CREATE INDEX idx_transaction_histories_created ON transaction_histories(created_at DESC);

-- Stock Market Indices
CREATE INDEX idx_stocks_exchange ON stocks(exchange_id);
CREATE INDEX idx_stock_category_mappings_stock ON stock_category_mappings(stock_id);
CREATE INDEX idx_historical_prices_stock ON historical_prices(stock_id);
CREATE INDEX idx_historical_prices_timestamp ON historical_prices(timestamp DESC);

-- GIN trigram indexes for fast searches
CREATE INDEX idx_stocks_name_trgm ON stocks USING gin(name gin_trgm_ops);
CREATE INDEX idx_news_articles_title_trgm ON news_articles USING gin(title gin_trgm_ops);

-- Portfolio & Orders Indices
CREATE INDEX idx_portfolios_user ON portfolios(user_id);
CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_orders_portfolio ON orders(portfolio_id);
CREATE INDEX idx_orders_stock ON orders(stock_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_trade_histories_order ON trade_histories(order_id);
CREATE INDEX idx_trade_histories_portfolio ON trade_histories(portfolio_id);
CREATE INDEX idx_trade_histories_created ON trade_histories(execution_time DESC);

-- Alerts & Notifications
CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_stock ON price_alerts(stock_id);
CREATE INDEX idx_notification_histories_user ON notification_histories(user_id);
CREATE INDEX idx_notification_histories_created ON notification_histories(sent_at DESC);
CREATE INDEX idx_user_alerts_user ON user_alerts(user_id);

-- News & Social
CREATE INDEX idx_news_category_mappings_article ON news_category_mappings(news_article_id);
CREATE INDEX idx_news_bookmarks_user ON news_bookmarks(user_id);

-- AI Chats
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_analysis_histories_user ON ai_analysis_histories(user_id);

-- Support
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
