/**
 * Database Configuration and Connection Pool
 * Handles PostgreSQL database connections and initialization
 */

const { Pool } = require('pg');

/**
 * Create a new PostgreSQL connection pool.
 *
 * In a production environment like Render, all connection details are provided
 * in a single DATABASE_URL environment variable. This is the modern, standard
 * way to connect to hosted databases.
 *
 * The old method of using individual DB_USER, DB_HOST, etc., is good for
 * local setups but is replaced by the connection string for deployment.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
});


/**
 * Pool event handlers (Your original code, preserved)
 */
pool.on('connect', (client) => {
  console.log(`New client connected to database (${client.processID})`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

pool.on('acquire', (client) => {
  console.log(`Client ${client.processID} acquired from pool`);
});

pool.on('remove', (client) => {
  console.log(`Client ${client.processID} removed from pool`);
});

/**
 * Test database connection (Your original code, preserved)
 * @returns {Promise<boolean>} Connection success status
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();

    console.log('Database connection successful:');
    console.log('- Time:', result.rows[0].current_time);
    console.log('- Version:', result.rows[0].version.split(' ').slice(0, 2).join(' '));

    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

/**
 * Initialize database tables (Your original code, preserved)
 * Creates necessary tables if they don't exist
 */
async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create analyses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url VARCHAR(2048) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        crawl_data JSONB,
        seo_analysis JSONB,
        ai_insights JSONB,
        report_url VARCHAR(500)
      );
    `);

    // Create prompts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'general',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255) DEFAULT 'system'
      );
    `);

    // Create analysis_prompts junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analysis_prompts (
        analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
        prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
        response JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (analysis_id, prompt_id)
      );
    `);

    // Create indexes for better performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_analyses_url ON analyses(url);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active);`);

    // Insert default prompts if they don't exist
    await client.query(`
      INSERT INTO prompts (name, description, content, category)
      VALUES
        (
          'seo-technical-analysis',
          'Comprehensive technical SEO analysis',
          'Analyze the following webpage data for technical SEO issues. Focus on: 1) Page load performance, 2) Meta tags and structured data, 3) HTML structure and semantics, 4) Mobile responsiveness, 5) Core Web Vitals. Provide specific recommendations for improvement.',
          'technical'
        ),
        (
          'content-quality-review',
          'Content quality and relevance assessment',
          'Evaluate the content quality of this webpage. Consider: 1) Content relevance and value, 2) Keyword usage and density, 3) Content structure and readability, 4) User engagement potential, 5) E-A-T (Expertise, Authoritativeness, Trustworthiness). Suggest content improvements.',
          'content'
        ),
        (
          'competitive-analysis',
          'Competitive positioning analysis',
          'Based on the webpage content and structure, provide a competitive analysis focusing on: 1) Unique value propositions, 2) Content gaps compared to competitors, 3) Technical advantages or disadvantages, 4) Opportunities for differentiation. Include actionable insights.',
          'competitive'
        )
      ON CONFLICT (name) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Database tables initialized successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a query with parameters (Your original code, preserved)
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Query error:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions (Your original code, preserved)
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  return await pool.connect();
}

/**
 * Close all connections in the pool (Your original code, preserved)
 */
async function end() {
  await pool.end();
  console.log('Database connection pool closed');
}

// Export everything as before
module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  initializeDatabase,
  end
};