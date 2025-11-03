/**
 * SEO Analyzer Backend Server
 * Main entry point for the Express.js API server
 */

console.log('--- SERVER.JS FILE V3 STARTED ---');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');

// Import routes
const analyzeRoutes = require('./routes/analyze');
const promptsRoutes = require('./routes/prompts');
const reportsRoutes = require('./routes/reports');

// Import database configuration
const { pool, initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Middleware Configuration
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * Request logging and timing middleware
 */
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

/**
 * Health check endpoint
 */
console.log('--- SETTING UP /api/health ROUTE ---');
app.get('/api/health', async (req, res) => {
  console.log('--- /api/health ROUTE WAS HIT ---');
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

/**
 * API Routes
 */
app.use('/api/analyze', analyzeRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/reports', reportsRoutes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'SEO Analyzer API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      analyze: '/api/analyze',
      prompts: '/api/prompts',
      reports: '/api/reports'
    }
  });
});

/**
 * 404 Error Handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global Error Handler
 */
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Joi validation error
  if (error.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Database error
  if (error.code && error.code.startsWith('PG')) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'A database error occurred',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

/**
 * Graceful shutdown handler
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

/**
 * Unhandled promise rejection handler
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('🔄 Starting server initialization...');

    // Validate required environment variables
    console.log('🔍 Checking environment variables...');
    const requiredEnvVars = ['DATABASE_URL', 'CLAUDE_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
      console.error('Please check your backend/.env file and ensure all required variables are set.');
      process.exit(1);
    }
    console.log('✅ Environment variables validated');

    // Initialize database
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    // Test database connection
    console.log('🔄 Testing database connection...');
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection verified');

    // Start the server
    app.listen(PORT, () => {
      console.log(`
========================================
🚀 SEO Analyzer API Server Started
========================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Database: PostgreSQL (Connected)
AI Service: Claude API (Configured)
Time: ${new Date().toISOString()}
========================================
Available Endpoints:
- GET  /api/health       - Health check
- POST /api/analyze      - Submit analysis
- GET  /api/analyze/:id  - Get analysis
- GET  /api/prompts      - List prompts
========================================
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('\n💡 Common issues:');
    console.error('  1. PostgreSQL is not running');
    console.error('  2. DATABASE_URL in .env is incorrect');
    console.error('  3. CLAUDE_API_KEY is missing or invalid');
    console.error('  4. Database connection is refused\n');
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;