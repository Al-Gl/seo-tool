-- Initial database schema for SEO Crawler & AI Analysis Platform
-- Migration: 001_initial_schema.sql

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing analysis results
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url VARCHAR(500) NOT NULL,
    prompt_type VARCHAR(100) NOT NULL,
    custom_prompt TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    crawl_data JSONB,
    ai_analysis TEXT,
    seo_score INTEGER,
    recommendations JSONB,
    performance_metrics JSONB,
    error_message TEXT,
    processing_time INTEGER, -- in milliseconds
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_analyses_url ON analyses(url);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_analyses_prompt_type ON analyses(prompt_type);

-- Table for storing analysis prompt templates
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    template_key VARCHAR(100) UNIQUE NOT NULL,
    prompt_template TEXT NOT NULL,
    variables JSONB,
    description TEXT,
    active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for prompt templates
CREATE INDEX idx_prompt_templates_template_key ON prompt_templates(template_key);
CREATE INDEX idx_prompt_templates_active ON prompt_templates(active);

-- Table for caching crawl results to improve performance
CREATE TABLE analysis_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url_hash VARCHAR(64) UNIQUE NOT NULL,
    url VARCHAR(500) NOT NULL,
    crawl_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for cache lookups
CREATE INDEX idx_analysis_cache_url_hash ON analysis_cache(url_hash);
CREATE INDEX idx_analysis_cache_expires_at ON analysis_cache(expires_at);

-- Junction table for tracking which prompts were used in analyses
CREATE TABLE analysis_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    prompt_template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    prompt_content TEXT NOT NULL,
    ai_response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for junction table
CREATE INDEX idx_analysis_prompts_analysis_id ON analysis_prompts(analysis_id);
CREATE INDEX idx_analysis_prompts_template_id ON analysis_prompts(prompt_template_id);

-- Table for storing generated reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    report_type VARCHAR(50) DEFAULT 'pdf',
    file_path VARCHAR(500),
    file_size INTEGER,
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Index for reports
CREATE INDEX idx_reports_analysis_id ON reports(analysis_id);
CREATE INDEX idx_reports_expires_at ON reports(expires_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update timestamps
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for analysis summary (for dashboard/reporting)
CREATE VIEW analysis_summary AS
SELECT 
    DATE(created_at) as analysis_date,
    COUNT(*) as total_analyses,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_analyses,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_analyses,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_analyses,
    AVG(CASE WHEN status = 'completed' THEN seo_score END) as avg_seo_score,
    AVG(CASE WHEN status = 'completed' THEN processing_time END) as avg_processing_time
FROM analyses
GROUP BY DATE(created_at)
ORDER BY analysis_date DESC;