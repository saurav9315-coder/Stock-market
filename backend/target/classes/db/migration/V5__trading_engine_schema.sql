-- V5__trading_engine_schema.sql
-- Database migration for Stock Market Analysis Platform Trading Engine & OMS

-- 1. PORTFOLIOS EXTENSION
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(10) NOT NULL DEFAULT 'LIVE';
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS total_realized_pnl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS total_invested NUMERIC(18, 4) NOT NULL DEFAULT 0.0000;

DROP INDEX IF EXISTS idx_portfolios_user_mode;
CREATE UNIQUE INDEX idx_portfolios_user_mode ON portfolios(user_id, trading_mode) WHERE deleted_at IS NULL;

-- 2. WALLET BALANCES EXTENSION FOR DEMO TRADING
ALTER TABLE wallet_balances ADD COLUMN IF NOT EXISTS demo_available_balance NUMERIC(18, 4) NOT NULL DEFAULT 100000.0000;
ALTER TABLE wallet_balances ADD COLUMN IF NOT EXISTS demo_locked_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000;

-- 3. ORDERS TABLE ENHANCEMENT
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(10) NOT NULL DEFAULT 'LIVE';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS trigger_price NUMERIC(18, 4);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS avg_fill_price NUMERIC(18, 4);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_fee NUMERIC(18, 4) NOT NULL DEFAULT 0.0000;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_order_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_reason VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejected_reason VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS filled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_orders_user_mode ON orders(user_id, trading_mode);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stock_status ON orders(stock_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_client_order_id ON orders(client_order_id) WHERE client_order_id IS NOT NULL AND deleted_at IS NULL;

-- 4. ORDER AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS order_audit_logs (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    action_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_order_audit_logs_order_id ON order_audit_logs(order_id);

-- 5. TRADE EXECUTIONS TABLE
CREATE TABLE IF NOT EXISTS trade_executions (
    id UUID PRIMARY KEY,
    trade_number VARCHAR(50) NOT NULL UNIQUE,
    buy_order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
    sell_order_id UUID REFERENCES orders(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE RESTRICT,
    trading_mode VARCHAR(10) NOT NULL DEFAULT 'LIVE',
    side VARCHAR(10) NOT NULL,
    quantity NUMERIC(18, 6) NOT NULL,
    price NUMERIC(18, 4) NOT NULL,
    total_value NUMERIC(18, 4) NOT NULL,
    fee NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_trade_executions_user ON trade_executions(user_id, trading_mode);
CREATE INDEX IF NOT EXISTS idx_trade_executions_stock ON trade_executions(stock_id);

-- 6. HOLDINGS ENHANCEMENT
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS total_cost_basis NUMERIC(18, 4) NOT NULL DEFAULT 0.0000;
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS realized_pnl NUMERIC(18, 4) NOT NULL DEFAULT 0.0000;

-- 7. FEE STRUCTURES & DISCOUNT RULES
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    brokerage_rate_pct NUMERIC(8, 4) NOT NULL DEFAULT 0.0010, -- 0.1%
    platform_fee_flat NUMERIC(18, 4) NOT NULL DEFAULT 1.0000,  -- $1.00 flat
    tax_rate_pct NUMERIC(8, 4) NOT NULL DEFAULT 0.0005,      -- 0.05%
    gst_rate_pct NUMERIC(8, 4) NOT NULL DEFAULT 0.1800,      -- 18% on fees
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    trading_mode VARCHAR(10) NOT NULL DEFAULT 'ALL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS discount_rules (
    id UUID PRIMARY KEY,
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    min_volume NUMERIC(18, 4) DEFAULT 0.0000,
    discount_pct NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Seed default fee structure if missing
INSERT INTO fee_structures (id, name, brokerage_rate_pct, platform_fee_flat, tax_rate_pct, gst_rate_pct, is_active, trading_mode, created_by)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'DEFAULT_FEE_STRUCTURE', 0.0010, 1.0000, 0.0005, 0.1800, true, 'ALL', 'SYSTEM')
ON CONFLICT (name) DO NOTHING;

-- 8. DIVIDENDS & DIVIDEND PAYOUTS
CREATE TABLE IF NOT EXISTS dividends (
    id UUID PRIMARY KEY,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE RESTRICT,
    amount_per_share NUMERIC(18, 4) NOT NULL,
    ex_date TIMESTAMP WITH TIME ZONE NOT NULL,
    record_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ANNOUNCED', -- ANNOUNCED, PAYING, COMPLETED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS dividend_payouts (
    id UUID PRIMARY KEY,
    dividend_id UUID NOT NULL REFERENCES dividends(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE RESTRICT,
    trading_mode VARCHAR(10) NOT NULL DEFAULT 'LIVE',
    shares_held NUMERIC(18, 6) NOT NULL,
    gross_amount NUMERIC(18, 4) NOT NULL,
    tax_deducted NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    net_amount NUMERIC(18, 4) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_dividend_payouts_user ON dividend_payouts(user_id);
