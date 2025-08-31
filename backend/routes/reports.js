/**
 * Reports Routes
 * Handles PDF report generation and management
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const { query } = require('../config/database');
const ReportGenerator = require('../services/report-generator');

const router = express.Router();
const reportGenerator = new ReportGenerator();

/**
 * Validation schemas
 */
const reportRequestSchema = Joi.object({
  format: Joi.string().valid('A4', 'Letter', 'Legal').default('A4'),
  includeRawData: Joi.boolean().default(false),
  theme: Joi.string().valid('professional', 'modern', 'minimal').default('professional'),
  sections: Joi.array().items(
    Joi.string().valid('summary', 'technical', 'content', 'recommendations', 'metrics', 'raw')
  ).default(['summary', 'technical', 'content', 'recommendations', 'metrics'])
});

/**
 * GET /api/reports/:analysisId/pdf
 * Generate and download PDF report for an analysis
 */
router.get('/:analysisId/pdf', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    // Validate UUID format
    if (!analysisId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid Analysis ID',
        message: 'Please provide a valid analysis ID',
        timestamp: new Date().toISOString()
      });
    }

    // Get analysis data
    const analysisResult = await query(`
      SELECT 
        a.*,
        CASE 
          WHEN a.report_url IS NOT NULL AND a.report_url != '' 
          THEN true 
          ELSE false 
        END as has_existing_report
      FROM analyses a 
      WHERE a.id = $1
    `, [analysisId]);

    if (analysisResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${analysisId}`,
        timestamp: new Date().toISOString()
      });
    }

    const analysis = analysisResult.rows[0];

    if (analysis.status !== 'completed') {
      return res.status(400).json({
        error: 'Analysis Not Complete',
        message: `Analysis is ${analysis.status}. Report can only be generated for completed analyses.`,
        timestamp: new Date().toISOString()
      });
    }

    // Check if report already exists and is recent
    let reportPath = null;
    if (analysis.has_existing_report && analysis.report_url) {
      const existingReportPath = path.resolve(analysis.report_url);
      if (fs.existsSync(existingReportPath)) {
        const stats = fs.statSync(existingReportPath);
        const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        // Use existing report if less than 1 hour old
        if (ageHours < 1) {
          reportPath = existingReportPath;
          console.log(`Using existing report: ${reportPath}`);
        }
      }
    }

    // Generate new report if needed
    if (!reportPath) {
      console.log(`Generating new report for analysis: ${analysisId}`);
      
      // Prepare analysis data
      const analysisData = {
        id: analysis.id,
        url: analysis.url,
        analyzedAt: analysis.completed_at,
        loadTime: analysis.crawl_data?.loadTime || 0,
        content: analysis.crawl_data?.content || {},
        performance: analysis.crawl_data?.performance || {},
        seoSummary: analysis.crawl_data?.seoSummary || {},
        images: analysis.crawl_data?.images || [],
        seoScores: analysis.seo_analysis?.scores || {},
        summary: analysis.seo_analysis?.summary || '',
        recommendations: analysis.seo_analysis?.recommendations || [],
        comprehensiveAnalysis: analysis.seo_analysis?.comprehensiveAnalysis || {},
        aiInsights: analysis.ai_insights || {}
      };

      // Validate report options
      const { error, value } = reportRequestSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          error: 'Invalid Report Options',
          message: error.details[0].message,
          timestamp: new Date().toISOString()
        });
      }

      // Generate report
      reportPath = await reportGenerator.generateAnalysisReport(analysisData, {
        format: value.format,
        includeRawData: value.includeRawData,
        theme: value.theme,
        filename: `seo-report-${analysisId}-${Date.now()}.pdf`
      });

      // Update analysis with report URL
      await query(`
        UPDATE analyses 
        SET report_url = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [reportPath, analysisId]);
    }

    // Set response headers for PDF download
    const filename = `seo-analysis-report-${analysisId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream the file
    const fileStream = fs.createReadStream(reportPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming report file:', error);
      res.status(500).json({
        error: 'File Stream Error',
        message: 'Failed to stream report file',
        timestamp: new Date().toISOString()
      });
    });

    console.log(`Report served: ${filename}`);

  } catch (error) {
    console.error('Error generating/serving report:', error);
    res.status(500).json({
      error: 'Report Generation Error',
      message: 'Failed to generate or serve report',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/reports/:analysisId/generate
 * Generate a new report (force regeneration)
 */
router.post('/:analysisId/generate', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    // Validate UUID format
    if (!analysisId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid Analysis ID',
        message: 'Please provide a valid analysis ID',
        timestamp: new Date().toISOString()
      });
    }

    // Validate request body
    const { error, value } = reportRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString()
      });
    }

    // Get analysis data
    const analysisResult = await query('SELECT * FROM analyses WHERE id = $1', [analysisId]);

    if (analysisResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${analysisId}`,
        timestamp: new Date().toISOString()
      });
    }

    const analysis = analysisResult.rows[0];

    if (analysis.status !== 'completed') {
      return res.status(400).json({
        error: 'Analysis Not Complete',
        message: `Analysis is ${analysis.status}. Report can only be generated for completed analyses.`,
        timestamp: new Date().toISOString()
      });
    }

    // Prepare analysis data
    const analysisData = {
      id: analysis.id,
      url: analysis.url,
      analyzedAt: analysis.completed_at,
      loadTime: analysis.crawl_data?.loadTime || 0,
      content: analysis.crawl_data?.content || {},
      performance: analysis.crawl_data?.performance || {},
      seoSummary: analysis.crawl_data?.seoSummary || {},
      images: analysis.crawl_data?.images || [],
      seoScores: analysis.seo_analysis?.scores || {},
      summary: analysis.seo_analysis?.summary || '',
      recommendations: analysis.seo_analysis?.recommendations || [],
      comprehensiveAnalysis: analysis.seo_analysis?.comprehensiveAnalysis || {},
      aiInsights: analysis.ai_insights || {}
    };

    console.log(`Force generating new report for analysis: ${analysisId}`);

    // Generate report
    const reportPath = await reportGenerator.generateAnalysisReport(analysisData, {
      format: value.format,
      includeRawData: value.includeRawData,
      theme: value.theme,
      filename: `seo-report-${analysisId}-${Date.now()}.pdf`
    });

    // Update analysis with new report URL
    await query(`
      UPDATE analyses 
      SET report_url = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [reportPath, analysisId]);

    res.json({
      message: 'Report generated successfully',
      analysisId: analysisId,
      reportUrl: `/api/reports/${analysisId}/pdf`,
      options: value,
      generatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      error: 'Report Generation Error',
      message: 'Failed to generate report',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/reports/:analysisId/status
 * Check report generation status
 */
router.get('/:analysisId/status', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    // Validate UUID format
    if (!analysisId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid Analysis ID',
        message: 'Please provide a valid analysis ID',
        timestamp: new Date().toISOString()
      });
    }

    // Get analysis data
    const analysisResult = await query(`
      SELECT 
        id, url, status, completed_at, report_url,
        CASE 
          WHEN report_url IS NOT NULL AND report_url != '' 
          THEN true 
          ELSE false 
        END as has_report
      FROM analyses 
      WHERE id = $1
    `, [analysisId]);

    if (analysisResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${analysisId}`,
        timestamp: new Date().toISOString()
      });
    }

    const analysis = analysisResult.rows[0];

    let reportStatus = {
      analysisId: analysis.id,
      analysisStatus: analysis.status,
      hasReport: analysis.has_report,
      reportAvailable: false,
      reportUrl: null,
      reportAge: null
    };

    if (analysis.has_report && analysis.report_url) {
      const reportPath = path.resolve(analysis.report_url);
      
      if (fs.existsSync(reportPath)) {
        const stats = fs.statSync(reportPath);
        const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        reportStatus.reportAvailable = true;
        reportStatus.reportUrl = `/api/reports/${analysisId}/pdf`;
        reportStatus.reportAge = `${ageHours.toFixed(1)} hours`;
        reportStatus.reportSize = this.formatBytes(stats.size);
        reportStatus.reportCreated = stats.mtime.toISOString();
      }
    }

    res.json({
      ...reportStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking report status:', error);
    res.status(500).json({
      error: 'Status Check Error',
      message: 'Failed to check report status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/reports/:analysisId
 * Delete report file for an analysis
 */
router.delete('/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    // Validate UUID format
    if (!analysisId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid Analysis ID',
        message: 'Please provide a valid analysis ID',
        timestamp: new Date().toISOString()
      });
    }

    // Get analysis data
    const analysisResult = await query(`
      SELECT report_url FROM analyses WHERE id = $1
    `, [analysisId]);

    if (analysisResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis Not Found',
        message: `No analysis found with ID: ${analysisId}`,
        timestamp: new Date().toISOString()
      });
    }

    const analysis = analysisResult.rows[0];

    if (!analysis.report_url) {
      return res.status(404).json({
        error: 'No Report Found',
        message: 'No report file exists for this analysis',
        timestamp: new Date().toISOString()
      });
    }

    // Delete the report file
    const reportPath = path.resolve(analysis.report_url);
    if (fs.existsSync(reportPath)) {
      fs.unlinkSync(reportPath);
      console.log(`Deleted report file: ${reportPath}`);
    }

    // Update database to remove report URL
    await query(`
      UPDATE analyses 
      SET report_url = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [analysisId]);

    res.json({
      message: 'Report deleted successfully',
      analysisId: analysisId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      error: 'Report Deletion Error',
      message: 'Failed to delete report',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/reports/list
 * Get list of all available reports
 */
router.get('/list', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const validSortColumns = ['created_at', 'updated_at', 'url'];
    const validSortOrders = ['asc', 'desc'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    const limitValue = Math.min(parseInt(limit) || 20, 100);
    const offsetValue = parseInt(offset) || 0;

    // Get analyses with reports
    const reportsResult = await query(`
      SELECT 
        id, url, status, completed_at, report_url, created_at, updated_at
      FROM analyses 
      WHERE report_url IS NOT NULL AND report_url != '' AND status = 'completed'
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $1 OFFSET $2
    `, [limitValue, offsetValue]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM analyses 
      WHERE report_url IS NOT NULL AND report_url != '' AND status = 'completed'
    `);

    const total = parseInt(countResult.rows[0].total);

    // Check file existence and get file info
    const reports = await Promise.all(
      reportsResult.rows.map(async (analysis) => {
        const reportData = {
          analysisId: analysis.id,
          url: analysis.url,
          status: analysis.status,
          completedAt: analysis.completed_at,
          reportUrl: `/api/reports/${analysis.id}/pdf`,
          createdAt: analysis.created_at,
          updatedAt: analysis.updated_at,
          fileExists: false,
          fileSize: null,
          fileAge: null
        };

        if (analysis.report_url) {
          const reportPath = path.resolve(analysis.report_url);
          
          if (fs.existsSync(reportPath)) {
            const stats = fs.statSync(reportPath);
            const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
            
            reportData.fileExists = true;
            reportData.fileSize = formatBytes(stats.size);
            reportData.fileAge = `${ageHours.toFixed(1)} hours`;
          }
        }

        return reportData;
      })
    );

    res.json({
      reports: reports,
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
    console.error('Error fetching reports list:', error);
    res.status(500).json({
      error: 'Reports List Error',
      message: 'Failed to fetch reports list',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/reports/cleanup
 * Clean up old report files
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { maxAgeHours = 24 } = req.body;
    
    // Validate max age
    const maxAge = Math.max(1, Math.min(parseInt(maxAgeHours) || 24, 168)); // 1 hour to 1 week

    console.log(`Starting report cleanup: older than ${maxAge} hours`);
    
    const deletedCount = await reportGenerator.cleanupOldReports(maxAge);

    res.json({
      message: `Cleanup completed successfully`,
      deletedCount: deletedCount,
      maxAgeHours: maxAge,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error during report cleanup:', error);
    res.status(500).json({
      error: 'Cleanup Error',
      message: 'Failed to cleanup old reports',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/reports/health
 * Health check for reports service
 */
router.get('/health', async (req, res) => {
  try {
    // Check report directory
    const reportsDir = path.join(__dirname, '..', 'reports');
    const dirExists = fs.existsSync(reportsDir);
    
    let stats = null;
    if (dirExists) {
      const files = fs.readdirSync(reportsDir);
      const totalSize = files.reduce((sum, file) => {
        const filePath = path.join(reportsDir, file);
        const fileStat = fs.statSync(filePath);
        return sum + fileStat.size;
      }, 0);
      
      stats = {
        totalFiles: files.length,
        totalSize: formatBytes(totalSize),
        directory: reportsDir
      };
    }

    // Get recent reports count
    const recentReportsResult = await query(`
      SELECT COUNT(*) as count 
      FROM analyses 
      WHERE report_url IS NOT NULL 
      AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `);

    const recentReportsCount = parseInt(recentReportsResult.rows[0].count);

    res.json({
      status: 'healthy',
      reportsDirectory: {
        exists: dirExists,
        writable: dirExists && fs.access ? true : null,
        stats: stats
      },
      recentReports24h: recentReportsCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reports health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Format bytes to human readable format
 * @param {number} bytes - Bytes value
 * @returns {string} Formatted bytes string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;