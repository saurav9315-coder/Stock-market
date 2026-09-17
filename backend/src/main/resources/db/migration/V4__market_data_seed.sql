-- V4__market_data_seed.sql
-- Seed standard stock exchanges and market indices

-- Seed Exchanges
INSERT INTO exchanges (id, name, code, country, timezone, opening_time, closing_time, created_at, created_by, version) VALUES
('e8ebc899-9c0b-4ef8-bb6d-6bb9bd380e01', 'New York Stock Exchange', 'NYSE', 'USA', 'America/New_York', '09:30:00', '16:00:00', NOW(), 'SYSTEM', 0),
('e8ebc899-9c0b-4ef8-bb6d-6bb9bd380e02', 'NASDAQ', 'NASDAQ', 'USA', 'America/New_York', '09:30:00', '16:00:00', NOW(), 'SYSTEM', 0),
('e8ebc899-9c0b-4ef8-bb6d-6bb9bd380e03', 'National Stock Exchange of India', 'NSE', 'India', 'Asia/Kolkata', '09:15:00', '15:30:00', NOW(), 'SYSTEM', 0),
('e8ebc899-9c0b-4ef8-bb6d-6bb9bd380e04', 'Bombay Stock Exchange', 'BSE', 'India', 'Asia/Kolkata', '09:15:00', '15:30:00', NOW(), 'SYSTEM', 0)
ON CONFLICT (code) DO NOTHING;

-- Seed Market Indices
INSERT INTO market_indices (id, name, symbol, value, change_amount, change_percent, created_at, created_by, version) VALUES
('i8ebc899-9c0b-4ef8-bb6d-6bb9bd380f01', 'Dow Jones Industrial Average', '.DJI', 39000.0000, 0.0000, 0.00, NOW(), 'SYSTEM', 0),
('i8ebc899-9c0b-4ef8-bb6d-6bb9bd380f02', 'S&P 500', '.SPX', 5300.0000, 0.0000, 0.00, NOW(), 'SYSTEM', 0),
('i8ebc899-9c0b-4ef8-bb6d-6bb9bd380f03', 'NASDAQ Composite', '.IXIC', 16000.0000, 0.0000, 0.00, NOW(), 'SYSTEM', 0),
('i8ebc899-9c0b-4ef8-bb6d-6bb9bd380f04', 'NIFTY 50', '^NSEI', 23500.0000, 0.0000, 0.00, NOW(), 'SYSTEM', 0),
('i8ebc899-9c0b-4ef8-bb6d-6bb9bd380f05', 'BANK NIFTY', '^NSEBANK', 50000.0000, 0.0000, 0.00, NOW(), 'SYSTEM', 0),
('i8ebc899-9c0b-4ef8-bb6d-6bb9bd380f06', 'SENSEX', '^BSESN', 77000.0000, 0.0000, 0.00, NOW(), 'SYSTEM', 0)
ON CONFLICT (symbol) DO NOTHING;
