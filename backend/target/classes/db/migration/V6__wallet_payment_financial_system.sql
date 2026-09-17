-- V6__wallet_payment_financial_system.sql
-- Migration for Wallet, Payment, and Financial Transaction System

ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS ifsc_swift VARCHAR(50);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT 'IN';
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'VERIFIED';

ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);
ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS admin_notes VARCHAR(255);

ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS admin_notes VARCHAR(255);

ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details VARCHAR(1000),
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
