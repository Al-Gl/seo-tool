/**
 * SEO Analyzer Backend Server - Simplified for Initial Testing
 * Main entry point for the Express.js API server without database dependency
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { loadAnalyses, saveAnalysis, getStorageStats, cleanupOldAnalyses } = require('./utils/storage');

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

app.get('/api/prompts', (req, res) => {
  res.json({
    prompts: [
      { id: 'seo-audit', name: 'Complete SEO Audit', description: 'Comprehensive SEO analysis' },
      { id: 'content-analysis', name: 'Content Analysis', description: 'Focus on content quality' },
      { id: 'technical-seo', name: 'Technical SEO', description: 'Technical performance analysis' }
    ]
  });
});

app.post('/api/analyze', (req, res) => {
  const { url, promptType } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Simulate analysis with a fake ID
  const analysisId = `test-${Date.now()}`;
  
  res.json({
    id: analysisId,
    url: url,
    promptType: promptType || 'seo-audit',
    status: 'pending',
    message: 'Analysis started successfully (test mode)',
    estimatedTime: '30-60 seconds'
  });
});

// Persistent storage for analysis status (survives server restarts)
let analysisStatus = new Map();

// Load existing analyses on startup
function initializeStorage() {
  console.log('🔄 Initializing persistent storage...');
  analysisStatus = loadAnalyses();
  
  const stats = getStorageStats(analysisStatus);
  console.log('📊 Storage initialized:', stats);
  
  // Clean up old analyses (older than 24 hours)
  cleanupOldAnalyses(analysisStatus, 24);
  
  return analysisStatus;
}

app.get('/api/analyze/:id/status', (req, res) => {
  const { id } = req.params;
  
  console.log(`🔄 Status request for analysis ID: ${id}`);
  
  // Get or initialize analysis status
  let status = analysisStatus.get(id);
  
  if (!status) {
    // Initialize new analysis
    status = {
      id: id,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing...',
      startedAt: new Date().toISOString()
    };
    analysisStatus.set(id, status);
    console.log(`📝 Initialized new analysis: ${id}`, status);
  }
  
  // Only progress if not already completed
  if (status.status !== 'completed' && status.status !== 'failed' && status.status !== 'cancelled') {
    // Simulate progressive analysis
    if (status.progress < 100) {
      // Simulate gradual progress
      const progressIncrement = Math.random() * 15 + 10; // 10-25% increment
      const oldProgress = status.progress;
      status.progress = Math.min(100, status.progress + progressIncrement);
      
      console.log(`⚡ Progress update: ${id} - ${oldProgress.toFixed(1)}% → ${status.progress.toFixed(1)}%`);
      
      // Update status and steps based on progress
      if (status.progress < 25) {
        status.status = 'crawling';
        status.currentStep = 'Crawling website...';
      } else if (status.progress < 75) {
        status.status = 'analyzing';
        status.currentStep = 'Analyzing with AI...';
      } else if (status.progress < 100) {
        status.status = 'analyzing';
        status.currentStep = 'Generating recommendations...';
      } else {
        status.status = 'completed';
        status.currentStep = 'Analysis complete!';
        status.completedAt = new Date().toISOString();
        console.log(`✅ Analysis completed: ${id}`);
      }
      
      // Save to persistent storage
      saveAnalysis(analysisStatus, id, status);
    }
  } else {
    console.log(`🔒 Analysis ${id} is already in final state: ${status.status}`);
  }
  
  // Disable caching to ensure real-time updates
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  console.log(`📤 Sending status response for ${id}:`, {
    status: status.status,
    progress: status.progress,
    currentStep: status.currentStep
  });
  
  res.json(status);
});

app.get('/api/analyze/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`📊 Full analysis request for ID: ${id}`);
  
  // Check if analysis is completed
  const status = analysisStatus.get(id);
  
  console.log(`🔍 Found analysis status:`, status ? {
    id: status.id,
    status: status.status,
    progress: status.progress
  } : 'NOT FOUND');
  
  if (status && status.status === 'completed') {
    console.log(`✅ Returning completed analysis for ${id}`);
    // Return full analysis results in frontend-expected format
    const completedAnalysis = {
      id: id,
      url: 'https://example.com',
      status: 'completed',
      analysisType: 'seo-audit',
      customPrompt: null,
      progress: 100,
      estimatedTimeRemaining: 0,
      results: {
        seoScore: 75,
        criticalIssues: ['Missing meta description', 'Slow loading speed'],
        quickWins: ['Add alt text to images', 'Optimize title tags'],
        recommendations: ['Improve page speed', 'Add structured data'],
        technicalIssues: ['Page speed optimization needed'],
        contentIssues: ['Meta descriptions missing on key pages'],
        performanceMetrics: {
          loadTime: 2.1,
          coreWebVitals: { lcp: 2.8, fid: 0.1, cls: 0.05 }
        }
      },
      createdAt: status.startedAt,
      updatedAt: status.completedAt || new Date().toISOString()
    };
    
    res.json(completedAnalysis);
  } else if (!status) {
    console.log(`❌ No analysis found for ID: ${id}`);
    res.status(404).json({
      error: 'Analysis not found',
      message: `Analysis with ID ${id} does not exist`
    });
  } else {
    console.log(`⏳ Analysis ${id} still in progress - Status: ${status.status}, Progress: ${status.progress}%`);
    // Return current status if not completed
    const inProgressAnalysis = {
      id: id,
      url: 'https://example.com',
      status: status.status,
      analysisType: 'seo-audit',
      customPrompt: null,
      progress: status.progress,
      estimatedTimeRemaining: Math.max(0, Math.ceil((100 - status.progress) * 0.6)),
      results: null,
      createdAt: status.startedAt,
      updatedAt: new Date().toISOString()
    };
    
    res.json(inProgressAnalysis);
  }
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
    console.log('🚀 Starting SEO Analyzer Backend Server (Simple Mode with Persistent Storage)...');
    
    // Initialize persistent storage
    initializeStorage();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
      console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
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