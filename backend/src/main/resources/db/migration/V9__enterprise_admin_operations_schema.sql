-- V9__enterprise_admin_operations_schema.sql
-- Enterprise Admin Backend & Operations System Schema

-- 1. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    description VARCHAR(255),
    data_type VARCHAR(20) NOT NULL DEFAULT 'STRING',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_system_settings_category ON system_settings(category) WHERE deleted_at IS NULL;

-- 2. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'ANNOUNCEMENT', -- ANNOUNCEMENT, MAINTENANCE, EMERGENCY, MARKETING
    target_audience VARCHAR(30) NOT NULL DEFAULT 'ALL', -- ALL, VERIFIED_USERS, TRADERS, VIP
    scheduled_at TIMESTAMP WITH TIME ZONE,
    broadcast_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, BROADCASTED, CANCELLED
    broadcast_channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP', -- IN_APP, EMAIL, ALL
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_announcements_status ON announcements(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_scheduled ON announcements(scheduled_at) WHERE status = 'SCHEDULED' AND deleted_at IS NULL;

-- 3. ENHANCE ADMIN AUDIT LOGS TABLE
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS request_id VARCHAR(100);
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS url VARCHAR(512);
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS before_state JSONB;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS after_state JSONB;

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- 4. SEED INITIAL SYSTEM SETTINGS
INSERT INTO system_settings (id, setting_key, setting_value, category, description, data_type, is_public, created_by)
VALUES
(gen_random_uuid(), 'platform.maintenance.mode', 'false', 'SYSTEM', 'Enable or disable maintenance mode', 'BOOLEAN', true, 'SYSTEM'),
(gen_random_uuid(), 'trading.hours.open', '09:15', 'TRADING', 'Stock market open time (HH:mm)', 'STRING', true, 'SYSTEM'),
(gen_random_uuid(), 'trading.hours.close', '15:30', 'TRADING', 'Stock market close time (HH:mm)', 'STRING', true, 'SYSTEM'),
(gen_random_uuid(), 'trading.fee.percentage', '0.001', 'TRADING', 'Standard trading fee rate (0.1%)', 'NUMBER', false, 'SYSTEM'),
(gen_random_uuid(), 'trading.large.trade.threshold', '50000.00', 'RISK', 'Threshold in USD for large trade alerts', 'NUMBER', false, 'SYSTEM'),
(gen_random_uuid(), 'wallet.deposit.min.amount', '10.00', 'FINANCE', 'Minimum deposit limit in USD', 'NUMBER', true, 'SYSTEM'),
(gen_random_uuid(), 'wallet.deposit.max.amount', '100000.00', 'FINANCE', 'Maximum deposit limit in USD', 'NUMBER', true, 'SYSTEM'),
(gen_random_uuid(), 'wallet.withdrawal.min.amount', '20.00', 'FINANCE', 'Minimum withdrawal limit in USD', 'NUMBER', true, 'SYSTEM'),
(gen_random_uuid(), 'wallet.withdrawal.max.amount', '50000.00', 'FINANCE', 'Maximum withdrawal limit in USD', 'NUMBER', true, 'SYSTEM'),
(gen_random_uuid(), 'ai.rate.limit.daily', '100', 'AI', 'Maximum AI prompts per user per day', 'NUMBER', false, 'SYSTEM')
ON CONFLICT (setting_key) DO NOTHING;
