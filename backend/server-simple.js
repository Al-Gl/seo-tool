/**
 * SEO Analyzer Backend Server - Simplified for Initial Testing
 * Main entry point for the Express.js API server without database dependency
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { loadAnalyses, saveAnalysis, getStorageStats, cleanupOldAnalyses } = require('./utils/storage');

// Import real analysis routes
const analyzeRoutes = require('./routes/analyze-simple');

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
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

/**
 * Basic API endpoints for testing
 */
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    geminiApiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Use real analysis routes
app.use('/api/analyze', analyzeRoutes);

app.get('/api/prompts', (req, res) => {
  res.json({
    prompts: [
      { id: 'seo-audit', name: 'Complete SEO Audit', description: 'Comprehensive SEO analysis' },
      { id: 'content-analysis', name: 'Content Analysis', description: 'Focus on content quality' },
      { id: 'technical-seo', name: 'Technical SEO', description: 'Technical performance analysis' }
    ]
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

/**
 * Start server
 */
async function startServer() {
  try {
    console.log('🚀 Starting SEO Analyzer Backend Server (Simple Mode with Real Analysis)...');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
      console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ❌'}`);
      console.log(`🔍 Analysis Mode: Real crawling and AI analysis enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;