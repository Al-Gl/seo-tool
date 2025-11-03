/**
 * Analysis Routes - Simple Mode (No Database)
 * Handles URL analysis requests with in-memory storage
 */

const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

// Import services
const WebCrawler = require('../services/crawler');
const AIAnalyzer = require('../services/ai-analyzer');
const { loadAnalyses, saveAnalysis } = require('../utils/storage');

const router = express.Router();

// Initialize services
const crawler = new WebCrawler();

let aiAnalyzer;
try {
  aiAnalyzer = new AIAnalyzer();
  console.log('✅ AI Analyzer initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize AI Analyzer:', error.message);
  console.error('⚠️  Please ensure GEMINI_API_KEY is set in backend/.env file');
  console.error('⚠️  Current GEMINI_API_KEY status:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
  throw new Error(`AI Analyzer initialization failed: ${error.message}`);
}

// In-memory storage for analyses
let analysisStorage = loadAnalyses();

/**
 * Validation schemas
 */
const analyzeRequestSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please provide a valid URL',
    'any.required': 'URL is required'
  }),
  prompts: Joi.array().items(Joi.string()).optional(),
  options: Joi.object({
    waitTime: Joi.number().min(0).max(30000).optional(),
    includeImages: Joi.boolean().optional(),
    deepAnalysis: Joi.boolean().optional()
  }).optional()
}).unknown(true);

/**
 * POST /api/analyze
 * Submit a URL for SEO analysis
 */
router.post('/', async (req, res) => {
  try {
    console.log('--- RECEIVED ANALYSIS REQUEST ---:', JSON.stringify(req.body, null, 2));

    // Validate request
    const { error, value } = analyzeRequestSchema.validate(req.body);
    if (error) {
      console.error('--- VALIDATION FAILED ---:', error.details[0].message);
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString()
      });
    }

    const { url, prompts: promptNames = [], options = {} } = value;

    console.log(`✅ New analysis request for: ${url}`);

    // Create analysis record
    const analysisId = uuidv4();
    const analysisRecord = {
      id: analysisId,
      url: url,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing...',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    analysisStorage.set(analysisId, analysisRecord);
    saveAnalysis(analysisStorage, analysisId, analysisRecord);

    // Start analysis asynchronously
    processAnalysis(analysisId, url, promptNames, options)
      .catch(error => {
        console.error(`❌ Analysis ${analysisId} failed:`, error);
        const failedRecord = analysisStorage.get(analysisId) || {};
        failedRecord.status = 'failed';
        failedRecord.error = error.message;
        failedRecord.progress = 0;
        failedRecord.updatedAt = new Date().toISOString();
        analysisStorage.set(analysisId, failedRecord);
        saveAnalysis(analysisStorage, analysisId, failedRecord);
      });

    res.status(202).json({
      message: 'Analysis started successfully',
      analysisId: analysisId,
      id: analysisId,
      status: 'pending',
      estimatedTime: '2-5 minutes',
      checkUrl: `/api/analyze/${analysisId}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error starting analysis:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to start analysis',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/analyze/:id
 * Get analysis results by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📊 Fetching analysis: ${id}`);

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid analysis ID',
        timestamp: new Date().toISOString()
      });
    }

    // Get analysis from storage
    const analysis = analysisStorage.get(id);

    if (!analysis) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    // Return analysis data
    const response = {
      id: analysis.id,
      url: analysis.url,
      status: analysis.status,
      progress: analysis.progress || 0,
      currentStep: analysis.currentStep,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
      startedAt: analysis.startedAt,
      completedAt: analysis.completedAt,
      timestamp: new Date().toISOString()
    };

    if (analysis.status === 'completed' && analysis.results) {
      response.crawlData = analysis.results.crawlData;
      response.seoAnalysis = analysis.results.seoAnalysis;
      response.aiInsights = analysis.results.aiInsights;
      response.recommendations = analysis.results.recommendations;
    }

    if (analysis.status === 'failed') {
      response.error = 'Analysis Failed';
      response.errorMessage = analysis.error || 'An error occurred during analysis';
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching analysis:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch analysis',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/analyze/:id/status
 * Get analysis status by ID
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = analysisStorage.get(id);

    if (!analysis) {
      return res.status(404).json({
        error: 'Not Found',
        status: 'not_found'
      });
    }

    res.json({
      status: analysis.status,
      progress: analysis.progress || 0
    });

  } catch (error) {
    console.error('❌ Error fetching analysis status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * DELETE /api/analyze/:id
 * Cancel/delete an analysis
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = analysisStorage.get(id);

    if (!analysis) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    // Update status to cancelled if not completed
    if (analysis.status !== 'completed' && analysis.status !== 'failed') {
      analysis.status = 'cancelled';
      analysis.updatedAt = new Date().toISOString();
      analysisStorage.set(id, analysis);
      saveAnalysis(analysisStorage, id, analysis);
    }

    res.json({
      message: 'Analysis cancelled successfully',
      analysisId: id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error cancelling analysis:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to cancel analysis',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process analysis asynchronously
 * @param {string} analysisId - Analysis ID
 * @param {string} url - URL to analyze
 * @param {Array} promptNames - Prompt names to use
 * @param {Object} options - Analysis options
 */
async function processAnalysis(analysisId, url, promptNames, options) {
  try {
    console.log(`🚀 Starting analysis: ${analysisId}`);

    // Update status to processing
    updateAnalysisProgress(analysisId, 10, 'processing', 'Starting crawl...');

    // Step 1: Crawl the URL
    console.log(`🔗 Crawling URL: ${url}`);
    let crawlData;
    try {
      updateAnalysisProgress(analysisId, 20, 'processing', 'Crawling website...');
      crawlData = await crawler.crawlUrl(url);
      console.log(`✅ Crawl completed for analysis: ${analysisId}`);
      console.log(`📊 Crawl data size: ${JSON.stringify(crawlData).length} bytes`);
      updateAnalysisProgress(analysisId, 40, 'processing', 'Crawl complete, analyzing...');
    } catch (crawlError) {
      console.error(`❌ Crawl failed for ${analysisId}:`, crawlError.message);
      throw new Error(`Failed to crawl URL: ${crawlError.message}`);
    } finally {
      // Always close the browser
      try {
        await crawler.close();
        console.log(`🔒 Browser closed for ${analysisId}`);
      } catch (closeError) {
        console.warn(`⚠️  Failed to close browser:`, closeError.message);
      }
    }

    // Step 2: Prepare default prompts
    updateAnalysisProgress(analysisId, 50, 'processing', 'Preparing AI analysis...');
    const defaultPrompts = [
      {
        id: uuidv4(),
        name: 'seo-technical-analysis',
        description: 'Technical SEO analysis',
        content: 'Analyze this webpage for technical SEO issues. Focus on performance, meta tags, HTML structure, and mobile responsiveness.',
        category: 'technical'
      },
      {
        id: uuidv4(),
        name: 'content-quality-review',
        description: 'Content quality assessment',
        content: 'Evaluate the content quality. Consider relevance, keyword usage, readability, and engagement potential.',
        category: 'content'
      }
    ];

    // Step 3: Run AI analysis
    console.log(`🤖 Starting AI analysis for ${analysisId}...`);
    let aiAnalysis;
    try {
      updateAnalysisProgress(analysisId, 60, 'processing', 'Running AI analysis...');
      aiAnalysis = await aiAnalyzer.analyzeCrawlData(crawlData, defaultPrompts);
      console.log(`✅ AI analysis completed for ${analysisId}`);
      console.log(`📝 Recommendations count: ${aiAnalysis.recommendations?.length || 0}`);
      updateAnalysisProgress(analysisId, 90, 'processing', 'Generating recommendations...');
    } catch (aiError) {
      console.error(`❌ AI analysis failed for ${analysisId}:`, aiError.message);
      console.error(`❌ AI error stack:`, aiError.stack);
      throw new Error(`AI analysis failed: ${aiError.message}`);
    }

    // Step 4: Compile results
    const seoAnalysis = {
      scores: aiAnalysis.seoScores || {},
      summary: aiAnalysis.summary || 'Analysis completed successfully',
      recommendations: Array.isArray(aiAnalysis.recommendations) ? aiAnalysis.recommendations : [],
      comprehensiveAnalysis: aiAnalysis.comprehensiveAnalysis || {},
      analysisTime: aiAnalysis.analysisTime || 0,
      promptCount: defaultPrompts.length
    };

    // Step 5: Mark as completed
    const finalRecord = analysisStorage.get(analysisId) || {};
    finalRecord.status = 'completed';
    finalRecord.progress = 100;
    finalRecord.currentStep = 'Analysis complete!';
    finalRecord.completedAt = new Date().toISOString();
    finalRecord.updatedAt = new Date().toISOString();
    finalRecord.results = {
      crawlData: crawlData,
      seoAnalysis: seoAnalysis,
      aiInsights: aiAnalysis,
      recommendations: aiAnalysis.recommendations || []
    };

    analysisStorage.set(analysisId, finalRecord);
    saveAnalysis(analysisStorage, analysisId, finalRecord);

    console.log(`✅✅✅ Analysis completed successfully: ${analysisId}`);

  } catch (error) {
    console.error(`❌❌❌ Analysis failed: ${analysisId}`);
    console.error(`❌ Error message:`, error.message);
    console.error(`❌ Error stack:`, error.stack);

    // Mark as failed
    const failedRecord = analysisStorage.get(analysisId) || {};
    failedRecord.status = 'failed';
    failedRecord.error = error.message || 'Unknown error occurred';
    failedRecord.progress = 0;
    failedRecord.updatedAt = new Date().toISOString();
    analysisStorage.set(analysisId, failedRecord);
    saveAnalysis(analysisStorage, analysisId, failedRecord);

    throw error;
  }
}

/**
 * Update analysis progress
 * @param {string} analysisId - Analysis ID
 * @param {number} progress - Progress percentage
 * @param {string} status - Analysis status
 * @param {string} currentStep - Current step description
 */
function updateAnalysisProgress(analysisId, progress, status, currentStep) {
  const record = analysisStorage.get(analysisId) || {};
  record.progress = progress;
  record.status = status;
  record.currentStep = currentStep;
  record.updatedAt = new Date().toISOString();
  analysisStorage.set(analysisId, record);
  saveAnalysis(analysisStorage, analysisId, record);
  console.log(`📊 Progress update: ${analysisId} - ${progress}% - ${currentStep}`);
}

module.exports = router;
