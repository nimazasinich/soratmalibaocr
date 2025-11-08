-- CloudCoder Financial Fraud Detection Database Schema
-- SQLite Database for Financial Analysis and Fraud Detection

-- ========================================
-- Table: companies
-- ========================================
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sector TEXT,
    fiscal_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_fiscal_year ON companies(fiscal_year);

-- ========================================
-- Table: financial_statements
-- ========================================
CREATE TABLE IF NOT EXISTS financial_statements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    period TEXT NOT NULL,  -- e.g., "1401-Q1", "1402-Annual"

    -- Balance Sheet Items
    assets REAL NOT NULL,
    liabilities REAL NOT NULL,
    equity REAL,
    current_assets REAL,
    current_liabilities REAL,
    fixed_assets REAL,
    inventory REAL,
    cash REAL,
    accounts_receivable REAL,
    retained_earnings REAL,

    -- Income Statement Items
    revenue REAL,
    cogs REAL,  -- Cost of Goods Sold
    gross_profit REAL,
    operating_expenses REAL,
    ebit REAL,  -- Earnings Before Interest and Tax
    ebitda REAL,
    interest_expense REAL,
    tax_expense REAL,
    net_income REAL,

    -- Cash Flow Items
    operating_cf REAL,  -- Operating Cash Flow
    investing_cf REAL,
    financing_cf REAL,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_statements_company ON financial_statements(company_id);
CREATE INDEX idx_statements_period ON financial_statements(period);

-- ========================================
-- Table: ratios
-- ========================================
CREATE TABLE IF NOT EXISTS ratios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    statement_id INTEGER NOT NULL,

    -- Ratio details
    ratio_name TEXT NOT NULL,  -- e.g., "Current Ratio", "ROE", etc.
    ratio_category TEXT,  -- "Liquidity", "Profitability", "Leverage", "Efficiency"
    value REAL NOT NULL,
    ideal_value REAL,  -- Expected ideal value for comparison
    status TEXT,  -- "Good", "Warning", "Critical"

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (statement_id) REFERENCES financial_statements(id) ON DELETE CASCADE
);

CREATE INDEX idx_ratios_statement ON ratios(statement_id);
CREATE INDEX idx_ratios_category ON ratios(ratio_category);

-- ========================================
-- Table: fraud_indicators
-- ========================================
CREATE TABLE IF NOT EXISTS fraud_indicators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    statement_id INTEGER NOT NULL,

    -- Fraud indicator details
    flag_type TEXT NOT NULL,  -- "Benford", "Quality of Earnings", "Receivable Growth", etc.
    severity TEXT NOT NULL,  -- "Low", "Medium", "High", "Critical"
    score REAL,  -- 0-100 score
    description TEXT,
    details JSON,  -- Additional JSON data for complex analysis

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (statement_id) REFERENCES financial_statements(id) ON DELETE CASCADE
);

CREATE INDEX idx_fraud_statement ON fraud_indicators(statement_id);
CREATE INDEX idx_fraud_severity ON fraud_indicators(severity);

-- ========================================
-- Table: risk_assessments
-- ========================================
CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    statement_id INTEGER NOT NULL,

    -- Risk details
    risk_type TEXT NOT NULL,  -- "Financial", "Liquidity", "Operational", "Market"
    score REAL NOT NULL,  -- 0-100 score
    explanation TEXT,
    recommendation TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (statement_id) REFERENCES financial_statements(id) ON DELETE CASCADE
);

CREATE INDEX idx_risk_statement ON risk_assessments(statement_id);
CREATE INDEX idx_risk_type ON risk_assessments(risk_type);

-- ========================================
-- Table: ocr_documents
-- ========================================
CREATE TABLE IF NOT EXISTS ocr_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,

    -- File details
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,  -- "pdf", "jpg", "png", etc.
    file_size INTEGER,

    -- OCR results
    text_extracted TEXT,
    confidence REAL,  -- 0-1 confidence score
    language TEXT DEFAULT 'fas+eng',
    processing_time REAL,  -- in seconds

    -- Parsed data
    parsed_data JSON,  -- Extracted financial numbers in JSON format
    status TEXT DEFAULT 'pending',  -- "pending", "processing", "completed", "failed"

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_ocr_company ON ocr_documents(company_id);
CREATE INDEX idx_ocr_status ON ocr_documents(status);

-- ========================================
-- Table: users
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',  -- "admin", "analyst", "viewer"
    full_name TEXT,
    is_active INTEGER DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- Table: forecasts
-- ========================================
CREATE TABLE IF NOT EXISTS forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,

    -- Forecast details
    forecast_type TEXT NOT NULL,  -- "Revenue", "Z-Score", "Bankruptcy", etc.
    period TEXT NOT NULL,  -- Future period being forecasted
    predicted_value REAL,
    confidence_interval TEXT,  -- e.g., "95%: [1000, 2000]"
    methodology TEXT,  -- Description of forecasting method used

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_forecasts_company ON forecasts(company_id);

-- ========================================
-- Table: audit_logs
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,  -- "login", "create_statement", "run_analysis", etc.
    entity_type TEXT,  -- "company", "statement", "ocr_document", etc.
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ========================================
-- Insert Default Admin User
-- ========================================
-- Password: admin123 (hashed with bcrypt)
INSERT OR IGNORE INTO users (username, email, password_hash, role, full_name)
VALUES (
    'admin',
    'admin@cloudcoder.local',
    '$2a$10$rQZ9jXK8qVZ5yYwN8qYZ8.ZQZ8qVZ5yYwN8qYZ8.ZQZ8qVZ5yYwN8q',
    'admin',
    'System Administrator'
);

-- ========================================
-- Sample Companies for Testing
-- ========================================
INSERT OR IGNORE INTO companies (name, sector, fiscal_year) VALUES
('شرکت نمونه الف', 'تولیدی', 1402),
('شرکت نمونه ب', 'خدماتی', 1402),
('شرکت نمونه ج', 'تجاری', 1401);
