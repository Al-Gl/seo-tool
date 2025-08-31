/**
 * Database setup utility for SEO Crawler & AI Analysis Platform
 * Handles database initialization, migrations, and seeding
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Database connection configuration
 */
const getDbConfig = () => {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };
    }
    
    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'seo_crawler',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
};

/**
 * Create database connection pool
 */
const pool = new Pool(getDbConfig());

/**
 * Execute SQL file
 * @param {string} filePath - Path to SQL file
 * @returns {Promise<void>}
 */
async function executeSqlFile(filePath) {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`✅ Executed: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`❌ Error executing ${path.basename(filePath)}:`, error.message);
        throw error;
    }
}

/**
 * Run database migrations
 * @returns {Promise<void>}
 */
async function runMigrations() {
    console.log('🔧 Running database migrations...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    
    for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        await executeSqlFile(filePath);
    }
    
    console.log('✅ All migrations completed successfully');
}

/**
 * Seed database with default data
 * @returns {Promise<void>}
 */
async function seedDatabase() {
    console.log('🌱 Seeding database with default data...');
    
    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = fs.readdirSync(seedsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    
    for (const file of seedFiles) {
        const filePath = path.join(seedsDir, file);
        await executeSqlFile(filePath);
    }
    
    console.log('✅ Database seeding completed successfully');
}

/**
 * Test database connection
 * @returns {Promise<void>}
 */
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connection successful:', result.rows[0]);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

/**
 * Create database tables and relationships
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
    console.log('🏗️  Initializing SEO Crawler database...');
    
    try {
        // Test connection first
        await testConnection();
        
        // Run migrations
        await runMigrations();
        
        // Seed with default data
        await seedDatabase();
        
        console.log('🎉 Database initialization completed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Start the backend server: cd backend && npm run dev');
        console.log('2. Test the API: curl http://localhost:3001/health');
        console.log('3. Submit an analysis: curl -X POST http://localhost:3001/api/analyze -H "Content-Type: application/json" -d \'{"url": "https://example.com"}\'');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

/**
 * Drop all tables (for development/testing)
 * @returns {Promise<void>}
 */
async function dropTables() {
    console.log('⚠️  Dropping all tables...');
    
    const dropQuery = `
        DROP VIEW IF EXISTS analysis_summary CASCADE;
        DROP TABLE IF EXISTS reports CASCADE;
        DROP TABLE IF EXISTS analysis_prompts CASCADE;
        DROP TABLE IF EXISTS analysis_cache CASCADE;
        DROP TABLE IF EXISTS prompt_templates CASCADE;
        DROP TABLE IF EXISTS analyses CASCADE;
        DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
        DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
    `;
    
    try {
        await pool.query(dropQuery);
        console.log('✅ All tables dropped successfully');
    } catch (error) {
        console.error('❌ Error dropping tables:', error.message);
        throw error;
    }
}

/**
 * Reset database (drop and reinitialize)
 * @returns {Promise<void>}
 */
async function resetDatabase() {
    console.log('🔄 Resetting database...');
    
    try {
        await testConnection();
        await dropTables();
        await runMigrations();
        await seedDatabase();
        console.log('✅ Database reset completed successfully!');
    } catch (error) {
        console.error('❌ Database reset failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

/**
 * Command line interface
 */
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'init':
            initializeDatabase();
            break;
        case 'migrate':
            runMigrations().then(() => pool.end());
            break;
        case 'seed':
            seedDatabase().then(() => pool.end());
            break;
        case 'reset':
            resetDatabase();
            break;
        case 'test':
            testConnection().then(() => pool.end());
            break;
        default:
            console.log('SEO Crawler Database Setup');
            console.log('');
            console.log('Usage: node setup.js <command>');
            console.log('');
            console.log('Commands:');
            console.log('  init     - Initialize database (migrate + seed)');
            console.log('  migrate  - Run migrations only');
            console.log('  seed     - Run seeds only');
            console.log('  reset    - Drop and reinitialize database');
            console.log('  test     - Test database connection');
            console.log('');
            console.log('Environment Variables:');
            console.log('  DATABASE_URL or DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    }
}

module.exports = {
    initializeDatabase,
    runMigrations,
    seedDatabase,
    testConnection,
    resetDatabase,
    dropTables
};