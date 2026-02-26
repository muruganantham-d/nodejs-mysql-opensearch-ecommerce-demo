// HEADER: Global test setup to stabilize environment values for Jest runs.
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'admin@123';
process.env.DB_NAME = process.env.DB_NAME || 'ecommerce_db';
process.env.OPENSEARCH_URL = process.env.OPENSEARCH_URL || 'http://127.0.0.1:9200';
process.env.PORT = process.env.PORT || '4000';

/*
BOTTOM EXPLANATION
- Responsibility: Provides default environment values so tests do not depend on local .env files.
- Key syntax: `process.env.X || fallback` keeps existing values but provides safe defaults.
- Common mistakes: Forgetting test env setup can cause modules to crash at import time.
*/
