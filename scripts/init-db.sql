-- ============================================================
-- RMS Backend - PostgreSQL Initialization Script
-- ============================================================
-- Runs on first container startup to configure the database
-- for the Reimbursement Management System.

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; (updated by saikot)

-- Create application schema if not using default public
-- CREATE SCHEMA IF NOT EXISTS rms;

-- Grant privileges
-- GRANT ALL PRIVILEGES ON SCHEMA public TO rms_admin;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rms_admin;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rms_admin;

-- Performance tuning for development
--ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements'; (updated by saikot)
--ALTER SYSTEM SET pg_stat_statements.track = 'all'; (updated by saikot)

-- Log configuration for debugging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 100;
