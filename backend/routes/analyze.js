/**
 * Analysis Routes
 * Handles URL analysis requests and management
 */

const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { query, getClient } = require('../config/database');

// Import services
const WebCrawler = require('../services/crawler');
const AIAnalyzer = require('../services/ai-analyzer');
const PromptManager = require('../services/prompt-manager');

const router = express.Router();

// Initialize services
const crawler = new WebCrawler();

let aiAnalyzer;
try {
  aiAnalyzer = new AIAnalyzer();
  console.log('✅ AI Analyzer initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize AI Analyzer:', error.message);
  console.error('⚠️ Please ensure GEMINI_API_KEY is set in backend/.env file');
  console.error('⚠️ Current GEMINI_API_KEY status:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
  throw new Error(`AI Analyzer initialization failed: ${error.message}`);
}

const promptManager = new PromptManager();

/**
 * Validation schemas
 */
const analyzeRequestSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please provide a valid URL',
    'any.required': 'URL is required'
  }),
  prompts: Joi.array().items(Joi.string().uuid()).optional().messages({
    'array.base': 'Prompts must be an array of UUIDs',
    'string.uuid': 'Each prompt must be a valid UUID'
  }),
  options: Joi.object({
    waitTime: Joi.number().min(0).max(30000).optional(),
    includeImages: Joi.boolean().optional(),
    deepAnalysis: Joi.boolean().optional()
  }).optional()
}).unknown(true); // <-- ADD THIS PART

/**
 * POST /api/analyze
 * Submit a URL for SEO analysis
 */
router.post('/', async (req, res) => {
  try {
    console.log('--- RECEIVED REQUEST BODY ---:', JSON.stringify(req.body, null, 2));
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

    const { url, prompts: promptIds = [], options = {} } = value;
    
    console.log(`New analysis request for: ${url}`);

    // Create analysis record
    const analysisId = uuidv4();
    await query(`
      INSERT INTO analyses (id, url, status, started_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `, [analysisId, url, 'pending']);

    // Start analysis asynchronously
    processAnalysis(analysisId, url, promptIds, options)
      .catch(error => {
        console.error(`Analysis ${analysisId} failed:`, error);
        // Update analysis status to failed
        query(`
          UPDATE analyses 
          SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, ['failed', error.message, analysisId])
        .catch(updateError => {
          console.error('Failed to update analysis status:', updateError);
        });
      });

    res.status(202).json({
      message: 'Analysis started successfully',
      analysisId: analysisId,
      status: 'pending',
      estimatedTime: '2-5 minutes',
      checkUrl: `/api/analyze/${analysisId}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error starting analysis:', error);
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

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid analysis ID',
        timestamp: new Date().toISOString()
      });
    }

    // Get analysis from database
    const result = await query('SELECT * FROM analyses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    const analysis = result.rows[0];
    
    // Get prompt results if available
    let promptResults = [];
    if (analysis.status === 'completed') {
      const promptsResult = await query(`
        SELECT ap.*, p.name, p.category, p.description
        FROM analysis_prompts ap
        JOIN prompts p ON ap.prompt_id = p.id
        WHERE ap.analysis_id = $1
        ORDER BY p.category, p.name
      `, [id]);
      
      promptResults = promptsResult.rows;
    }

    // Format response based on status
    const response = {
      id: analysis.id,
      url: analysis.url,
      status: analysis.status,
      createdAt: analysis.created_at,
      updatedAt: analysis.updated_at,
      startedAt: analysis.started_at,
      completedAt: analysis.completed_at
    };

    if (analysis.status === 'pending' || analysis.status === 'processing') {
      response.message = `Analysis is ${analysis.status}. Please check back in a moment.`;
      response.estimatedTimeRemaining = analysis.status === 'pending' ? '2-5 minutes' : '1-3 minutes';
    } else if (analysis.status === 'failed') {
      response.error = 'Analysis Failed';
      response.errorMessage = analysis.error_message;
    } else if (analysis.status === 'completed') {
      response.crawlData = analysis.crawl_data;
      response.seoAnalysis = analysis.seo_analysis;
      response.aiInsights = analysis.ai_insights;
      response.promptResults = promptResults;
      response.reportUrl = analysis.report_url;
    }

    res.json({
      ...response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch analysis',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT status FROM analyses WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', status: 'not_found' });
    }

    const status = result.rows[0].status;
    
    // Estimate progress based on status for the frontend
    let progress = 0;
    if (status === 'pending') progress = 10;
    if (status === 'processing') progress = 50;
    if (status === 'completed' || status === 'failed' || status === 'cancelled') progress = 100;

    res.json({ status, progress });

  } catch (error) {
    console.error('Error fetching analysis status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/analyze
 * Get all analyses with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const {
      status,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build query with filters
    let whereClause = '';
    const params = [];
    
    if (status) {
      whereClause = 'WHERE status = $1';
      params.push(status);
    }

    const validSortColumns = ['created_at', 'updated_at', 'url', 'status'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    const limitValue = Math.min(parseInt(limit) || 20, 100); // Max 100 results
    const offsetValue = parseInt(offset) || 0;

    // Get analyses
    const analysesResult = await query(`
      SELECT id, url, status, created_at, updated_at, started_at, completed_at, error_message
      FROM analyses
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limitValue, offsetValue]);

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total FROM analyses ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      analyses: analysesResult.rows,
      pagination: {
        total: total,
        limit: limitValue,
        offset: offsetValue,
        pages: Math.ceil(total / limitValue),
        currentPage: Math.floor(offsetValue / limitValue) + 1
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch analyses',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/analyze/:id
 * Delete an analysis
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid analysis ID',
        timestamp: new Date().toISOString()
      });
    }

    // Check if analysis exists
    const checkResult = await query('SELECT id FROM analyses WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    // Delete analysis (CASCADE will handle related records)
    await query('DELETE FROM analyses WHERE id = $1', [id]);

    res.json({
      message: 'Analysis deleted successfully',
      analysisId: id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete analysis',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process analysis asynchronously
 * @param {string} analysisId - Analysis ID
 * @param {string} url - URL to analyze
 * @param {Array} promptIds - Prompt IDs to use
 * @param {Object} options - Analysis options
 */
async function processAnalysis(analysisId, url, promptIds, options) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Update status to processing
    await client.query(`
      UPDATE analyses
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, ['processing', analysisId]);

    console.log(`🚀 Starting crawl for analysis: ${analysisId}`);
    console.log(`🔗 URL: ${url}`);

    // Step 1: Crawl the URL
    let crawlData;
    try {
      crawlData = await crawler.crawlUrl(url);
      console.log(`✅ Crawl completed for analysis: ${analysisId}`);
      console.log(`📊 Crawl data size: ${JSON.stringify(crawlData).length} bytes`);
    } catch (crawlError) {
      console.error(`❌ Crawl failed for ${analysisId}:`, crawlError.message);
      throw new Error(`Failed to crawl URL: ${crawlError.message}`);
    } finally {
      // Always close the browser to free up memory
      try {
        await crawler.close();
        console.log(`🔒 Browser closed for ${analysisId}`);
      } catch (closeError) {
        console.warn(`⚠️ Failed to close browser:`, closeError.message);
      }
    }

    // Store crawl data
    try {
      await client.query(`
        UPDATE analyses
        SET crawl_data = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [JSON.stringify(crawlData), analysisId]);
      console.log(`💾 Crawl data stored for ${analysisId}`);
    } catch (storageError) {
      console.error(`❌ Failed to store crawl data:`, storageError.message);
      throw new Error(`Failed to store crawl data: ${storageError.message}`);
    }

    // Step 2: Get prompts (use defaults if none specified)
    let prompts = [];
    try {
      if (promptIds.length > 0) {
        const promptsResult = await client.query(`
          SELECT * FROM prompts WHERE id = ANY($1) AND is_active = true
        `, [promptIds]);
        prompts = promptsResult.rows;
      } else {
        // Use default prompts
        const defaultPromptsResult = await client.query(`
          SELECT * FROM prompts
          WHERE category IN ('technical', 'content', 'competitive')
          AND is_active = true
          ORDER BY category
        `);
        prompts = defaultPromptsResult.rows;
      }
      console.log(`✅ Using ${prompts.length} prompts for analysis: ${analysisId}`);
    } catch (promptError) {
      console.error(`❌ Failed to fetch prompts:`, promptError.message);
      throw new Error(`Failed to fetch prompts: ${promptError.message}`);
    }

    // Step 3: Run AI analysis
    let aiAnalysis;
    try {
      console.log(`🤖 Starting AI analysis for ${analysisId}...`);
      aiAnalysis = await aiAnalyzer.analyzeCrawlData(crawlData, prompts);
      console.log(`✅ AI analysis completed for ${analysisId}`);
      console.log(`📊 AI analysis result size: ${JSON.stringify(aiAnalysis).length} bytes`);
      console.log(`📝 Recommendations count: ${aiAnalysis.recommendations?.length || 0}`);
    } catch (aiError) {
      console.error(`❌ AI analysis failed for ${analysisId}:`, aiError.message);
      console.error(`❌ AI error stack:`, aiError.stack);
      throw new Error(`AI analysis failed: ${aiError.message}`);
    }

    // Store AI analysis
    try {
      await client.query(`
        UPDATE analyses
        SET ai_insights = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [JSON.stringify(aiAnalysis), analysisId]);
      console.log(`💾 AI insights stored for ${analysisId}`);
    } catch (storageError) {
      console.error(`❌ Failed to store AI insights:`, storageError.message);
      throw new Error(`Failed to store AI insights: ${storageError.message}`);
    }

    // Step 4: Store individual prompt results
    try {
      for (const promptResult of aiAnalysis.promptResults) {
        await client.query(`
          INSERT INTO analysis_prompts (analysis_id, prompt_id, response)
          VALUES ($1, $2, $3)
          ON CONFLICT (analysis_id, prompt_id)
          DO UPDATE SET response = $3, created_at = CURRENT_TIMESTAMP
        `, [analysisId, promptResult.promptId, JSON.stringify(promptResult)]);
      }
      console.log(`💾 Stored ${aiAnalysis.promptResults.length} prompt results for ${analysisId}`);
    } catch (promptStorageError) {
      console.error(`❌ Failed to store prompt results:`, promptStorageError.message);
      // Don't throw here, this is not critical
    }

    // Step 5: Create SEO analysis summary
    const seoAnalysis = {
      scores: aiAnalysis.seoScores || {},
      summary: aiAnalysis.summary || 'Analysis completed successfully',
      recommendations: Array.isArray(aiAnalysis.recommendations) ? aiAnalysis.recommendations : [],
      comprehensiveAnalysis: aiAnalysis.comprehensiveAnalysis || {},
      analysisTime: aiAnalysis.analysisTime || 0,
      promptCount: prompts.length
    };
    console.log(`📊 SEO analysis summary created with ${seoAnalysis.recommendations.length} recommendations`);

    // Step 6: Mark as completed
    try {
      await client.query(`
        UPDATE analyses
        SET status = $1,
            seo_analysis = $2,
            completed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, ['completed', JSON.stringify(seoAnalysis), analysisId]);
      console.log(`✅ Analysis marked as completed: ${analysisId}`);
    } catch (completionError) {
      console.error(`❌ Failed to mark analysis as completed:`, completionError.message);
      throw new Error(`Failed to mark analysis as completed: ${completionError.message}`);
    }

    await client.query('COMMIT');

    console.log(`✅✅✅ Analysis completed successfully: ${analysisId}`);

  } catch (error) {
    await client.query('ROLLBACK');

    console.error(`❌❌❌ Analysis failed: ${analysisId}`);
    console.error(`❌ Error message:`, error.message);
    console.error(`❌ Error stack:`, error.stack);

    // Create detailed error message
    const errorMessage = error.message || 'Unknown error occurred';
    const errorDetails = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      url: url,
      phase: error.message.includes('crawl') ? 'crawling' :
             error.message.includes('AI') ? 'ai_analysis' :
             error.message.includes('store') || error.message.includes('storage') ? 'data_storage' :
             'unknown'
    };

    // Update analysis status to failed with detailed error
    try {
      await client.query(`
        UPDATE analyses
        SET status = $1,
            error_message = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, ['failed', JSON.stringify(errorDetails), analysisId]);
      console.log(`💾 Error details stored for ${analysisId}`);
    } catch (updateError) {
      console.error(`❌ Failed to update error status:`, updateError.message);
    }

    throw error;

  } finally {
    client.release();
  }
}

/**
 * Health check endpoint for analysis service
 */
router.get('/health/check', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    
    // Test AI analyzer connection
    const aiStatus = await aiAnalyzer.testConnection();
    
    // Get service statistics
    const statsResult = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM analyses
      WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
      GROUP BY status
    `);

    const stats = {};
    statsResult.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
    });

    res.json({
      status: 'healthy',
      services: {
        database: 'connected',
        aiAnalyzer: aiStatus ? 'connected' : 'disconnected',
        crawler: 'available'
      },
      stats24h: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;