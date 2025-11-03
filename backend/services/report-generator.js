/**
 * Report Generator Service
 * Handles PDF report generation using PDFKit
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Report Generator Class
 * Provides comprehensive PDF report generation capabilities
 */
class ReportGenerator {
  constructor() {
    this.reportDir = path.join(__dirname, '..', 'reports');
    this.templateDir = path.join(__dirname, '..', 'templates');
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    // Color scheme
    this.colors = {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      light: '#f8fafc',
      dark: '#1e293b',
      text: '#334155',
      lightText: '#64748b'
    };

    // Typography
    this.fonts = {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique',
      boldItalic: 'Helvetica-BoldOblique'
    };
  }

  /**
   * Generate comprehensive SEO analysis report
   * @param {Object} analysisData - Complete analysis data
   * @param {Object} options - Report generation options
   * @returns {Promise<string>} Path to generated PDF file
   */
  async generateAnalysisReport(analysisData, options = {}) {
    try {
      const {
        format = 'A4',
        filename = null,
        includeRawData = false,
        theme = 'professional'
      } = options;

      const reportFilename = filename || `seo-analysis-${Date.now()}.pdf`;
      const reportPath = path.join(this.reportDir, reportFilename);

      console.log(`Generating SEO analysis report: ${reportFilename}`);

      // Create PDF document
      const doc = new PDFDocument({
        size: format,
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `SEO Analysis Report - ${analysisData.url}`,
          Author: 'SEO Analyzer Platform',
          Subject: 'Comprehensive SEO Analysis',
          Keywords: 'SEO, Analysis, Technical SEO, Content Optimization',
          Creator: 'SEO Analyzer API',
          Producer: 'SEO Analyzer Platform v1.0'
        }
      });

      // Set up the stream
      const stream = fs.createWriteStream(reportPath);
      doc.pipe(stream);

      // Generate report content
      await this.generateCoverPage(doc, analysisData);
      await this.generateExecutiveSummary(doc, analysisData);
      await this.generateTechnicalAnalysis(doc, analysisData);
      await this.generateContentAnalysis(doc, analysisData);
      await this.generateRecommendations(doc, analysisData);
      await this.generateMetricsAndScores(doc, analysisData);
      
      if (includeRawData) {
        await this.generateRawDataSection(doc, analysisData);
      }

      await this.generateFooter(doc, analysisData);

      // Finalize the PDF
      doc.end();

      // Wait for the stream to finish
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      console.log(`Report generated successfully: ${reportPath}`);
      return reportPath;

    } catch (error) {
      console.error('Error generating analysis report:', error);
      throw error;
    }
  }

  /**
   * Generate cover page
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateCoverPage(doc, analysisData) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = doc.page.margins.left;

    // Header background
    doc.rect(0, 0, pageWidth, 150)
       .fill(this.colors.primary);

    // Title
    doc.fillColor('white')
       .font(this.fonts.bold)
       .fontSize(32)
       .text('SEO Analysis Report', margin, 40, { align: 'center' });

    // Subtitle
    doc.fontSize(16)
       .text('Comprehensive Website Analysis', margin, 85, { align: 'center' });

    // URL and date
    doc.fillColor(this.colors.text)
       .font(this.fonts.regular)
       .fontSize(14)
       .text(`URL: ${analysisData.url}`, margin, 200);
    
    doc.text(`Generated: ${new Date(analysisData.analyzedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin, 220);

    // Overall score circle
    if (analysisData.seoScores && analysisData.seoScores.overall) {
      const centerX = pageWidth / 2;
      const centerY = 350;
      const radius = 60;
      
      // Score circle background
      doc.circle(centerX, centerY, radius)
         .fillColor(this.getScoreColor(analysisData.seoScores.overall))
         .fill();

      // Score text
      doc.fillColor('white')
         .font(this.fonts.bold)
         .fontSize(36)
         .text(analysisData.seoScores.overall.toString(), centerX - 20, centerY - 15);

      doc.fontSize(12)
         .text('Overall Score', centerX - 30, centerY + 10);
    }

    // Key metrics summary
    let yPos = 450;
    const metrics = [
      { label: 'Load Time', value: `${analysisData.loadTime}ms` },
      { label: 'Word Count', value: analysisData.content?.content?.wordCount || 'N/A' },
      { label: 'Images', value: analysisData.content?.content?.images || 0 },
      { label: 'Links', value: analysisData.content?.content?.links?.total || 0 }
    ];

    doc.fillColor(this.colors.text)
       .font(this.fonts.bold)
       .fontSize(14)
       .text('Key Metrics', margin, yPos);

    yPos += 30;
    metrics.forEach((metric, index) => {
      const xPos = margin + (index % 2) * 250;
      const yPosition = yPos + Math.floor(index / 2) * 25;
      
      doc.font(this.fonts.regular)
         .fontSize(12)
         .fillColor(this.colors.lightText)
         .text(`${metric.label}:`, xPos, yPosition)
         .fillColor(this.colors.text)
         .text(metric.value, xPos + 80, yPosition);
    });

    doc.addPage();
  }

  /**
   * Generate executive summary section
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateExecutiveSummary(doc, analysisData) {
    this.addSectionHeader(doc, 'Executive Summary');

    const margin = doc.page.margins.left;
    let yPos = 120;

    // Summary text
    if (analysisData.summary) {
      doc.fillColor(this.colors.text)
         .font(this.fonts.regular)
         .fontSize(12)
         .text(analysisData.summary, margin, yPos, {
           width: doc.page.width - 2 * margin,
           align: 'left'
         });
      
      yPos = doc.y + 30;
    }

    // SEO Scores Overview
    if (analysisData.seoScores) {
      doc.font(this.fonts.bold)
         .fontSize(16)
         .fillColor(this.colors.dark)
         .text('SEO Scores Overview', margin, yPos);
      
      yPos += 30;

      const scores = [
        { label: 'Technical SEO', value: analysisData.seoScores.technical || 0 },
        { label: 'Content Quality', value: analysisData.seoScores.content || 0 },
        { label: 'Performance', value: analysisData.seoScores.performance || 0 },
        { label: 'User Experience', value: analysisData.seoScores.userExperience || 0 },
        { label: 'Accessibility', value: analysisData.seoScores.accessibility || 0 }
      ];

      scores.forEach((score, index) => {
        this.drawScoreBar(doc, margin, yPos + index * 40, score.label, score.value);
      });

      yPos += scores.length * 40 + 20;
    }

    // Top Issues (if available from analysis)
    if (analysisData.comprehensiveAnalysis) {
      doc.font(this.fonts.bold)
         .fontSize(16)
         .fillColor(this.colors.dark)
         .text('Critical Issues Identified', margin, yPos);
      
      yPos += 30;

      const issues = this.extractTopIssues(analysisData.comprehensiveAnalysis);
      issues.slice(0, 5).forEach((issue, index) => {
        doc.fillColor(this.colors.danger)
           .fontSize(10)
           .text('•', margin, yPos)
           .fillColor(this.colors.text)
           .text(issue, margin + 15, yPos, {
             width: doc.page.width - 2 * margin - 15
           });
        yPos += 20;
      });
    }

    doc.addPage();
  }

  /**
   * Generate technical analysis section
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateTechnicalAnalysis(doc, analysisData) {
    this.addSectionHeader(doc, 'Technical SEO Analysis');

    const margin = doc.page.margins.left;
    let yPos = 120;

    // Technical score and status
    if (analysisData.seoScores && analysisData.seoScores.technical) {
      this.drawScoreCard(doc, margin, yPos, 'Technical SEO Score', analysisData.seoScores.technical);
      yPos += 80;
    }

    // Technical findings
    const technical = analysisData.content?.technical || {};
    
    doc.font(this.fonts.bold)
       .fontSize(14)
       .fillColor(this.colors.dark)
       .text('Technical SEO Checklist', margin, yPos);
    
    yPos += 25;

    const technicalChecks = [
      { label: 'Has Title Tag', status: !!analysisData.content?.title },
      { label: 'Has Meta Description', status: technical.hasMetaDescription },
      { label: 'Has H1 Tag', status: technical.hasH1 },
      { label: 'Single H1 Tag', status: technical.h1Count === 1 },
      { label: 'Has Canonical URL', status: technical.hasCanonical },
      { label: 'SSL Enabled', status: technical.hasSSL },
      { label: 'Mobile Viewport', status: technical.hasViewport },
      { label: 'Has Favicon', status: technical.hasFavicon },
      { label: 'Robots Meta', status: technical.hasRobots }
    ];

    technicalChecks.forEach((check, index) => {
      this.drawCheckItem(doc, margin, yPos + index * 25, check.label, check.status);
    });

    yPos += technicalChecks.length * 25 + 30;

    // Performance metrics
    if (analysisData.performance) {
      doc.font(this.fonts.bold)
         .fontSize(14)
         .fillColor(this.colors.dark)
         .text('Performance Metrics', margin, yPos);
      
      yPos += 25;

      const performanceMetrics = [
        { label: 'Page Load Time', value: `${analysisData.loadTime}ms` },
        { label: 'Total Requests', value: analysisData.performance.resources?.requests || 'N/A' },
        { label: 'Total Size', value: this.formatBytes(analysisData.performance.resources?.totalSize || 0) },
        { label: 'Failed Requests', value: analysisData.performance.resources?.errors || 0 }
      ];

      performanceMetrics.forEach((metric, index) => {
        const xPos = margin + (index % 2) * 250;
        const yPosition = yPos + Math.floor(index / 2) * 25;
        
        doc.font(this.fonts.regular)
           .fontSize(11)
           .fillColor(this.colors.lightText)
           .text(`${metric.label}:`, xPos, yPosition)
           .fillColor(this.colors.text)
           .text(metric.value, xPos + 120, yPosition);
      });
    }

    doc.addPage();
  }

  /**
   * Generate content analysis section
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateContentAnalysis(doc, analysisData) {
    this.addSectionHeader(doc, 'Content Analysis');

    const margin = doc.page.margins.left;
    let yPos = 120;

    // Content score
    if (analysisData.seoScores && analysisData.seoScores.content) {
      this.drawScoreCard(doc, margin, yPos, 'Content Quality Score', analysisData.seoScores.content);
      yPos += 80;
    }

    // Content metrics
    const content = analysisData.content?.content || {};
    
    doc.font(this.fonts.bold)
       .fontSize(14)
       .fillColor(this.colors.dark)
       .text('Content Metrics', margin, yPos);
    
    yPos += 25;

    const contentMetrics = [
      { label: 'Word Count', value: content.wordCount || 0 },
      { label: 'Paragraphs', value: content.paragraphs || 0 },
      { label: 'Images', value: content.images || 0 },
      { label: 'Internal Links', value: content.links?.internal || 0 },
      { label: 'External Links', value: content.links?.external || 0 },
      { label: 'Total Links', value: content.links?.total || 0 }
    ];

    contentMetrics.forEach((metric, index) => {
      const xPos = margin + (index % 3) * 170;
      const yPosition = yPos + Math.floor(index / 3) * 25;
      
      doc.font(this.fonts.regular)
         .fontSize(11)
         .fillColor(this.colors.lightText)
         .text(`${metric.label}:`, xPos, yPosition)
         .fillColor(this.colors.text)
         .text(metric.value.toString(), xPos + 90, yPosition);
    });

    yPos += Math.ceil(contentMetrics.length / 3) * 25 + 30;

    // Heading structure
    if (analysisData.content?.headings) {
      doc.font(this.fonts.bold)
         .fontSize(14)
         .fillColor(this.colors.dark)
         .text('Heading Structure', margin, yPos);
      
      yPos += 25;

      const headings = analysisData.content.headings;
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((level, index) => {
        const count = headings[level]?.length || 0;
        const xPos = margin + (index % 3) * 170;
        const yPosition = yPos + Math.floor(index / 3) * 25;
        
        doc.font(this.fonts.regular)
           .fontSize(11)
           .fillColor(this.colors.lightText)
           .text(`${level.toUpperCase()}:`, xPos, yPosition)
           .fillColor(count > 0 ? this.colors.success : this.colors.lightText)
           .text(count.toString(), xPos + 40, yPosition);
      });

      yPos += 60;
    }

    // Image analysis
    if (analysisData.images) {
      doc.font(this.fonts.bold)
         .fontSize(14)
         .fillColor(this.colors.dark)
         .text('Image Analysis', margin, yPos);
      
      yPos += 25;

      const imagesWithoutAlt = analysisData.images.filter(img => !img.hasAlt).length;
      const imageMetrics = [
        { label: 'Total Images', value: analysisData.images.length },
        { label: 'Images with Alt Text', value: analysisData.images.length - imagesWithoutAlt },
        { label: 'Images without Alt Text', value: imagesWithoutAlt }
      ];

      imageMetrics.forEach((metric, index) => {
        doc.font(this.fonts.regular)
           .fontSize(11)
           .fillColor(this.colors.lightText)
           .text(`${metric.label}:`, margin, yPos)
           .fillColor(metric.value === imagesWithoutAlt && imagesWithoutAlt > 0 ? this.colors.warning : this.colors.text)
           .text(metric.value.toString(), margin + 150, yPos);
        yPos += 20;
      });
    }

    doc.addPage();
  }

  /**
   * Generate recommendations section
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateRecommendations(doc, analysisData) {
    this.addSectionHeader(doc, 'Recommendations');

    const margin = doc.page.margins.left;
    let yPos = 120;

    if (analysisData.recommendations && analysisData.recommendations.length > 0) {
      analysisData.recommendations.forEach((rec, index) => {
        // Check if we need a new page
        if (yPos > doc.page.height - 200) {
          doc.addPage();
          yPos = 50;
        }

        // Priority badge
        const priorityColor = this.getPriorityColor(rec.priority);
        doc.rect(margin, yPos, 80, 20)
           .fillColor(priorityColor)
           .fill();

        doc.fillColor('white')
           .font(this.fonts.bold)
           .fontSize(10)
           .text(rec.priority?.toUpperCase() || 'MEDIUM', margin + 5, yPos + 5);

        // Category badge
        doc.rect(margin + 90, yPos, 100, 20)
           .fillColor(this.colors.secondary)
           .fill();

        doc.fillColor('white')
           .fontSize(10)
           .text(rec.category?.toUpperCase() || 'GENERAL', margin + 95, yPos + 5);

        yPos += 35;

        // Title
        doc.fillColor(this.colors.dark)
           .font(this.fonts.bold)
           .fontSize(12)
           .text(rec.title || `Recommendation ${index + 1}`, margin, yPos);

        yPos += 20;

        // Description
        doc.fillColor(this.colors.text)
           .font(this.fonts.regular)
           .fontSize(10)
           .text(rec.description || 'No description available', margin, yPos, {
             width: doc.page.width - 2 * margin
           });

        yPos = doc.y + 10;

        // Impact and effort
        if (rec.impact || rec.effort) {
          doc.fillColor(this.colors.lightText)
             .fontSize(9)
             .text(`Impact: ${rec.impact || 'Unknown'} | Effort: ${rec.effort || 'Unknown'} | Timeframe: ${rec.timeframe || 'Unknown'}`, margin, yPos);
          yPos += 20;
        }

        yPos += 15; // Spacing between recommendations
      });
    } else {
      doc.fillColor(this.colors.text)
         .font(this.fonts.regular)
         .fontSize(12)
         .text('No specific recommendations generated. Please review the analysis sections for insights.', margin, yPos);
    }

    doc.addPage();
  }

  /**
   * Generate metrics and scores section
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateMetricsAndScores(doc, analysisData) {
    this.addSectionHeader(doc, 'Detailed Metrics & Scores');

    const margin = doc.page.margins.left;
    let yPos = 120;

    // SEO Summary
    if (analysisData.seoSummary) {
      doc.font(this.fonts.bold)
         .fontSize(14)
         .fillColor(this.colors.dark)
         .text('SEO Summary', margin, yPos);
      
      yPos += 25;

      const summary = analysisData.seoSummary;
      const summaryItems = [
        { label: 'Title Length', value: `${summary.titleLength} characters`, good: summary.titleLength >= 30 && summary.titleLength <= 60 },
        { label: 'Meta Description Length', value: `${summary.metaDescriptionLength} characters`, good: summary.metaDescriptionLength >= 120 && summary.metaDescriptionLength <= 160 },
        { label: 'H1 Count', value: summary.h1Count, good: summary.h1Count === 1 },
        { label: 'Images without Alt', value: summary.imagesWithoutAlt, good: summary.imagesWithoutAlt === 0 },
        { label: 'Schema Markup', value: summary.schemaMarkupCount, good: summary.schemaMarkupCount > 0 }
      ];

      summaryItems.forEach((item, index) => {
        const xPos = margin + (index % 2) * 250;
        const yPosition = yPos + Math.floor(index / 2) * 25;
        
        doc.font(this.fonts.regular)
           .fontSize(10)
           .fillColor(this.colors.lightText)
           .text(`${item.label}:`, xPos, yPosition)
           .fillColor(item.good ? this.colors.success : this.colors.warning)
           .text(item.value.toString(), xPos + 120, yPosition);
      });

      yPos += Math.ceil(summaryItems.length / 2) * 25 + 30;
    }

    // Detailed scores breakdown
    if (analysisData.comprehensiveAnalysis) {
      doc.font(this.fonts.bold)
         .fontSize(14)
         .fillColor(this.colors.dark)
         .text('Detailed Analysis Scores', margin, yPos);
      
      yPos += 25;

      const analysis = analysisData.comprehensiveAnalysis;
      const categories = ['technicalSEO', 'contentQuality', 'userExperience', 'performance', 'accessibility'];
      
      categories.forEach((category) => {
        if (analysis[category] && analysis[category].score !== undefined) {
          const score = analysis[category].score;
          const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          
          this.drawScoreBar(doc, margin, yPos, categoryName, score);
          yPos += 35;
        }
      });
    }

    doc.addPage();
  }

  /**
   * Generate raw data section (optional)
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateRawDataSection(doc, analysisData) {
    this.addSectionHeader(doc, 'Raw Data (Technical Reference)');

    const margin = doc.page.margins.left;
    let yPos = 120;

    // Add raw data as formatted JSON (truncated for readability)
    const rawDataText = JSON.stringify(analysisData, null, 2);
    const maxLength = 5000; // Limit raw data size in report
    const displayText = rawDataText.length > maxLength 
      ? rawDataText.substring(0, maxLength) + '\n\n... (truncated for brevity)'
      : rawDataText;

    doc.fillColor(this.colors.text)
       .font(this.fonts.regular)
       .fontSize(8)
       .text(displayText, margin, yPos, {
         width: doc.page.width - 2 * margin,
         height: doc.page.height - yPos - 100
       });
  }

  /**
   * Generate footer section
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} analysisData - Analysis data
   */
  async generateFooter(doc, analysisData) {
    // Add footer to each page
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      const bottomY = doc.page.height - 30;
      doc.fillColor(this.colors.lightText)
         .font(this.fonts.regular)
         .fontSize(8)
         .text(`SEO Analyzer Report - ${analysisData.url}`, doc.page.margins.left, bottomY)
         .text(`Page ${i + 1} of ${pageCount}`, doc.page.width - 100, bottomY);
    }
  }

  /**
   * Add section header
   * @param {PDFDocument} doc - PDF document instance
   * @param {string} title - Section title
   */
  addSectionHeader(doc, title) {
    const margin = doc.page.margins.left;
    
    // Header background
    doc.rect(0, 0, doc.page.width, 80)
       .fill(this.colors.light);

    // Title
    doc.fillColor(this.colors.dark)
       .font(this.fonts.bold)
       .fontSize(24)
       .text(title, margin, 30);

    // Underline
    doc.moveTo(margin, 70)
       .lineTo(doc.page.width - margin, 70)
       .strokeColor(this.colors.primary)
       .lineWidth(3)
       .stroke();
  }

  /**
   * Draw score bar
   * @param {PDFDocument} doc - PDF document instance
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} label - Score label
   * @param {number} score - Score value (0-100)
   */
  drawScoreBar(doc, x, y, label, score) {
    const barWidth = 200;
    const barHeight = 20;
    
    // Label
    doc.fillColor(this.colors.text)
       .font(this.fonts.regular)
       .fontSize(11)
       .text(label, x, y);

    // Background bar
    doc.rect(x, y + 15, barWidth, barHeight)
       .fillColor(this.colors.light)
       .fill()
       .strokeColor(this.colors.secondary)
       .stroke();

    // Score bar
    const scoreWidth = (score / 100) * barWidth;
    doc.rect(x, y + 15, scoreWidth, barHeight)
       .fillColor(this.getScoreColor(score))
       .fill();

    // Score text
    doc.fillColor(this.colors.text)
       .font(this.fonts.bold)
       .fontSize(10)
       .text(`${score}%`, x + barWidth + 10, y + 18);
  }

  /**
   * Draw score card
   * @param {PDFDocument} doc - PDF document instance
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} title - Card title
   * @param {number} score - Score value
   */
  drawScoreCard(doc, x, y, title, score) {
    const cardWidth = 200;
    const cardHeight = 60;

    // Card background
    doc.rect(x, y, cardWidth, cardHeight)
       .fillColor(this.colors.light)
       .fill()
       .strokeColor(this.colors.secondary)
       .stroke();

    // Title
    doc.fillColor(this.colors.text)
       .font(this.fonts.bold)
       .fontSize(12)
       .text(title, x + 10, y + 10);

    // Score
    doc.fillColor(this.getScoreColor(score))
       .font(this.fonts.bold)
       .fontSize(24)
       .text(`${score}%`, x + 10, y + 28);
  }

  /**
   * Draw check item
   * @param {PDFDocument} doc - PDF document instance
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} label - Check label
   * @param {boolean} status - Check status
   */
  drawCheckItem(doc, x, y, label, status) {
    // Status icon
    doc.fillColor(status ? this.colors.success : this.colors.danger)
       .fontSize(12)
       .text(status ? '✓' : '✗', x, y);

    // Label
    doc.fillColor(this.colors.text)
       .font(this.fonts.regular)
       .fontSize(11)
       .text(label, x + 20, y);
  }

  /**
   * Get color based on score
   * @param {number} score - Score value (0-100)
   * @returns {string} Color hex code
   */
  getScoreColor(score) {
    if (score >= 80) return this.colors.success;
    if (score >= 60) return this.colors.warning;
    return this.colors.danger;
  }

  /**
   * Get color based on priority
   * @param {string} priority - Priority level
   * @returns {string} Color hex code
   */
  getPriorityColor(priority) {
    switch (priority?.toLowerCase()) {
      case 'high': return this.colors.danger;
      case 'medium': return this.colors.warning;
      case 'low': return this.colors.success;
      default: return this.colors.secondary;
    }
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Bytes value
   * @returns {string} Formatted bytes string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extract top issues from analysis
   * @param {Object} analysis - Comprehensive analysis data
   * @returns {Array} Array of top issues
   */
  extractTopIssues(analysis) {
    const issues = [];
    
    // Extract issues from different categories
    Object.keys(analysis).forEach(category => {
      if (analysis[category] && analysis[category].issues) {
        issues.push(...analysis[category].issues);
      }
    });

    return issues.slice(0, 10); // Return top 10 issues
  }

  /**
   * Clean up old report files
   * @param {number} maxAgeHours - Maximum age in hours (default: 24)
   * @returns {Promise<number>} Number of files deleted
   */
  async cleanupOldReports(maxAgeHours = 24) {
    try {
      const files = fs.readdirSync(this.reportDir);
      let deletedCount = 0;
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.reportDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old report: ${file}`);
        }
      }

      console.log(`Cleanup completed: ${deletedCount} files deleted`);
      return deletedCount;
      
    } catch (error) {
      console.error('Error during report cleanup:', error);
      return 0;
    }
  }
}

module.exports = ReportGenerator;