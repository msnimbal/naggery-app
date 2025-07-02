
-- Naggery Database Initialization
-- This script runs when PostgreSQL container starts for the first time

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional indexes for performance (will be handled by Prisma migrations)
-- This file is mainly for any additional database setup

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Naggery database initialized successfully at %', NOW();
END $$;
