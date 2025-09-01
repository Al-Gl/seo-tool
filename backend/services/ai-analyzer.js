/**
 * AI Analyzer Service
 * Handles AI-powered analysis using Google Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Analyzer Class
 * Provides comprehensive AI analysis capabilities using Google Gemini
 */
class AIAnalyzer {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Configuration
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };

    this.safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ];
  }

  /**
   * Analyze crawled data using AI
   * @param {Object} crawlData - Data from web crawler
   * @param {Array} prompts - Analysis prompts to execute
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeCrawlData(crawlData, prompts = []) {
    try {
      const startTime = Date.now();
      console.log(`Starting AI analysis for: ${crawlData.url}`);

      // Prepare structured data for analysis
      const structuredData = this.prepareDataForAnalysis(crawlData);
      
      // Execute analysis prompts
      const analysisResults = {};
      const promptResults = [];

      for (const prompt of prompts) {
        try {
          const promptResult = await this.executePrompt(prompt, structuredData);
          promptResults.push({
            promptId: prompt.id,
            promptName: prompt.name,
            category: prompt.category,
            result: promptResult,
            executedAt: new Date().toISOString()
          });
          
          analysisResults[prompt.name] = promptResult;
          console.log(`Completed prompt: ${prompt.name}`);
        } catch (error) {
          console.error(`Failed to execute prompt ${prompt.name}:`, error);
          promptResults.push({
            promptId: prompt.id,
            promptName: prompt.name,
            category: prompt.category,
            error: error.message,
            executedAt: new Date().toISOString()
          });
        }
      }

      // Generate comprehensive SEO analysis
      const comprehensiveAnalysis = await this.generateComprehensiveAnalysis(structuredData);
      
      // Calculate analysis duration
      const analysisTime = Date.now() - startTime;

      const result = {
        url: crawlData.url,
        analyzedAt: new Date().toISOString(),
        analysisTime: analysisTime,
        
        // Prompt-based results
        promptResults: promptResults,
        promptAnalyses: analysisResults,
        
        // Comprehensive analysis
        comprehensiveAnalysis: comprehensiveAnalysis,
        
        // SEO scores and metrics
        seoScores: this.calculateSEOScores(crawlData, comprehensiveAnalysis),
        
        // Summary and recommendations
        summary: await this.generateSummary(crawlData, comprehensiveAnalysis),
        recommendations: await this.generateRecommendations(crawlData, comprehensiveAnalysis)
      };

      console.log(`AI analysis completed in ${analysisTime}ms`);
      return result;

    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Execute a single prompt against structured data
   * @param {Object} prompt - Prompt configuration
   * @param {Object} data - Structured data for analysis
   * @returns {Promise<Object>} Prompt execution result
   */
  async executePrompt(prompt, data) {
    try {
      const fullPrompt = `${prompt.content}\n\nWebpage Data:\n${JSON.stringify(data, null, 2)}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const text = response.text();

      return {
        content: text,
        finishReason: response.candidates[0]?.finishReason || 'STOP',
        safetyRatings: response.candidates[0]?.safetyRatings || [],
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0
        }
      };

    } catch (error) {
      console.error('Prompt execution failed:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive SEO analysis
   * @param {Object} data - Structured webpage data
   * @returns {Promise<Object>} Comprehensive analysis
   */
  async generateComprehensiveAnalysis(data) {
    const analysisPrompt = `
Perform a comprehensive SEO analysis of this webpage. Provide detailed insights in JSON format with the following structure:

{
  "technicalSEO": {
    "score": 0-100,
    "issues": [],
    "recommendations": []
  },
  "contentQuality": {
    "score": 0-100,
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
  },
  "userExperience": {
    "score": 0-100,
    "issues": [],
    "recommendations": []
  },
  "mobileOptimization": {
    "score": 0-100,
    "issues": [],
    "recommendations": []
  },
  "performance": {
    "score": 0-100,
    "metrics": {},
    "recommendations": []
  },
  "accessibility": {
    "score": 0-100,
    "issues": [],
    "recommendations": []
  }
}

Focus on actionable insights and specific recommendations.

Webpage Data:
${JSON.stringify(data, null, 2)}
`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from comprehensive analysis, returning raw text');
      }
      
      return { rawAnalysis: response };

    } catch (error) {
      console.error('Comprehensive analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate executive summary
   * @param {Object} crawlData - Original crawl data
   * @param {Object} analysis - AI analysis results
   * @returns {Promise<string>} Executive summary
   */
  async generateSummary(crawlData, analysis) {
    const summaryPrompt = `
Based on the SEO analysis results, provide a concise executive summary (2-3 paragraphs) that:

1. Highlights the overall SEO health of the webpage
2. Identifies the top 3 most critical issues
3. Mentions key strengths and opportunities
4. Provides an overall recommendation priority

Keep it business-focused and actionable for decision-makers.

URL: ${crawlData.url}
Analysis Results: ${JSON.stringify(analysis, null, 2)}
`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
        generationConfig: { ...this.generationConfig, maxOutputTokens: 512 },
        safetySettings: this.safetySettings,
      });

      return result.response.text();

    } catch (error) {
      console.error('Summary generation failed:', error);
      return 'Unable to generate summary due to analysis error.';
    }
  }

  /**
   * Generate prioritized recommendations
   * @param {Object} crawlData - Original crawl data
   * @param {Object} analysis - AI analysis results
   * @returns {Promise<Array>} Prioritized recommendations
   */
  async generateRecommendations(crawlData, analysis) {
    const recommendationsPrompt = `
Based on the SEO analysis, provide 5-10 prioritized recommendations in JSON format:

[
  {
    "priority": "high|medium|low",
    "category": "technical|content|ux|performance|accessibility",
    "title": "Brief title",
    "description": "Detailed description",
    "impact": "Expected impact description",
    "effort": "low|medium|high",
    "timeframe": "immediate|short-term|long-term"
  }
]

Focus on actionable items with clear business impact.

Analysis Results: ${JSON.stringify(analysis, null, 2)}
`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: recommendationsPrompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from recommendations, returning raw text');
      }
      
      return [{ 
        priority: 'high', 
        category: 'general', 
        title: 'Review Analysis Results',
        description: response,
        impact: 'Review detailed analysis for specific recommendations',
        effort: 'low',
        timeframe: 'immediate'
      }];

    } catch (error) {
      console.error('Recommendations generation failed:', error);
      return [];
    }
  }

  /**
   * Prepare crawl data for AI analysis
   * @param {Object} crawlData - Raw crawl data
   * @returns {Object} Structured data for analysis
   */
  prepareDataForAnalysis(crawlData) {
    return {
      url: crawlData.url,
      title: crawlData.content.title,
      description: crawlData.content.description,
      
      // Content metrics
      content: {
        wordCount: crawlData.content.content.wordCount,
        paragraphCount: crawlData.content.content.paragraphs,
        headingStructure: crawlData.content.headings,
        imageCount: crawlData.content.images.length,
        linkCounts: crawlData.content.content.links
      },

      // Technical SEO
      technical: crawlData.content.technical,
      
      // Performance data
      performance: {
        loadTime: crawlData.loadTime,
        resourceCounts: crawlData.performance.resources
      },

      // SEO summary
      seoSummary: crawlData.seoSummary,

      // Meta information
      meta: {
        canonical: crawlData.content.canonical,
        robots: crawlData.content.robots,
        openGraph: Object.keys(crawlData.content.openGraph).length,
        twitterCard: Object.keys(crawlData.content.twitterCard).length,
        schemaMarkup: crawlData.content.schemaMarkup.length
      }
    };
  }

  /**
   * Calculate SEO scores based on analysis
   * @param {Object} crawlData - Original crawl data
   * @param {Object} analysis - AI analysis results
   * @returns {Object} SEO scores
   */
  calculateSEOScores(crawlData, analysis) {
    const scores = {
      overall: 0,
      technical: 0,
      content: 0,
      performance: 0,
      userExperience: 0,
      accessibility: 0
    };

    try {
      // Extract scores from analysis if available
      if (analysis.technicalSEO && analysis.technicalSEO.score) {
        scores.technical = analysis.technicalSEO.score;
      }
      if (analysis.contentQuality && analysis.contentQuality.score) {
        scores.content = analysis.contentQuality.score;
      }
      if (analysis.performance && analysis.performance.score) {
        scores.performance = analysis.performance.score;
      }
      if (analysis.userExperience && analysis.userExperience.score) {
        scores.userExperience = analysis.userExperience.score;
      }
      if (analysis.accessibility && analysis.accessibility.score) {
        scores.accessibility = analysis.accessibility.score;
      }

      // Calculate overall score (weighted average)
      const weights = {
        technical: 0.25,
        content: 0.25,
        performance: 0.2,
        userExperience: 0.2,
        accessibility: 0.1
      };

      scores.overall = Math.round(
        scores.technical * weights.technical +
        scores.content * weights.content +
        scores.performance * weights.performance +
        scores.userExperience * weights.userExperience +
        scores.accessibility * weights.accessibility
      );

    } catch (error) {
      console.error('Error calculating SEO scores:', error);
      // Return default scores if calculation fails
    }

    return scores;
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello, please respond with "Connection successful"' }] }],
        generationConfig: { ...this.generationConfig, maxOutputTokens: 10 },
        safetySettings: this.safetySettings,
      });

      const response = result.response.text();
      return response.includes('Connection successful') || response.length > 0;

    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

module.exports = AIAnalyzer;