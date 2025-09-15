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
Based EXCLUSIVELY on the 'Webpage Data' provided below, provide CONCRETE, ACTIONABLE SEO guidance. For each recommendation, provide specific implementation steps, exact code snippets where applicable, and measurable targets. Focus on WHAT TO DO rather than what's wrong. Provide detailed guidance in JSON format:

{
  "technicalSEO": {
    "score": 0-100,
    "actions": [
      {
        "task": "Specific action to take",
        "implementation": "Exact steps or code to implement",
        "priority": "high|medium|low",
        "timeframe": "immediate|1-week|1-month",
        "impact": "Expected SEO improvement"
      }
    ]
  },
  "contentOptimization": {
    "score": 0-100,
    "actions": [
      {
        "task": "Specific content change needed",
        "implementation": "Exact text/structure to modify",
        "targetMetric": "Specific goal (e.g., 'increase word count to 1500 words')",
        "priority": "high|medium|low"
      }
    ]
  },
  "performanceImprovements": {
    "score": 0-100,
    "actions": [
      {
        "task": "Performance optimization needed",
        "implementation": "Technical steps to implement",
        "expectedGain": "Specific improvement (e.g., 'reduce load time by 2s')",
        "priority": "high|medium|low"
      }
    ]
  },
  "accessibilityFixes": {
    "score": 0-100,
    "actions": [
      {
        "task": "Accessibility improvement needed",
        "implementation": "Exact HTML/attribute changes",
        "standard": "WCAG guideline addressed",
        "priority": "high|medium|low"
      }
    ]
  }
}

IMPORTANT: Each "implementation" field must contain specific, actionable instructions that a developer can immediately execute. Include exact HTML tags, CSS properties, meta tag content, or configuration changes where relevant.

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
Based ONLY on the provided SEO analysis results, create a CONCRETE ACTION PLAN executive summary that:

1. Lists the top 3 IMMEDIATE ACTIONS to take (with specific implementation details)
2. Provides the next 3 HIGH-IMPACT actions for the following week
3. Specifies exact measurable outcomes expected from these changes
4. Gives a clear implementation timeline with priorities

Format as an actionable business plan, not an analysis report. Focus on WHAT TO DO and WHEN TO DO IT.

Example format:
"IMMEDIATE ACTIONS (This Week):
1. [Specific action with exact implementation steps]
2. [Specific action with exact implementation steps]
3. [Specific action with exact implementation steps]

HIGH-IMPACT ACTIONS (Next 2 Weeks):
1. [Specific action with expected outcome]
2. [Specific action with expected outcome]
3. [Specific action with expected outcome]

EXPECTED RESULTS: [Specific measurable improvements]"

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
Based ONLY on the following SEO analysis results, provide 5-10 CONCRETE, IMPLEMENTABLE recommendations. Each recommendation must include step-by-step instructions that a developer or content manager can immediately execute. Provide the response in JSON format:

[
  {
    "priority": "high|medium|low",
    "category": "technical|content|performance|accessibility",
    "title": "Specific action to implement",
    "description": "STEP-BY-STEP implementation instructions with exact code, text, or configurations",
    "implementation": {
      "steps": ["Step 1: Exact action", "Step 2: Exact action", "Step 3: Exact action"],
      "code": "Exact HTML/CSS/JS code to add or modify (if applicable)",
      "location": "Where exactly to make the change"
    },
    "expectedOutcome": "Specific, measurable result expected",
    "timeframe": "immediate|1-day|1-week|1-month",
    "effort": "low|medium|high",
    "tools": ["Specific tools or resources needed"]
  }
]

IMPORTANT: The "description" and "implementation.steps" must be so detailed that someone can execute them without additional research. Include exact values, specific locations, and concrete examples.

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
        effort: 'low'
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
    // Truncate the full text content to a reasonable length to avoid overly large prompts
    const truncatedTextContent = crawlData.content?.content?.textContent.substring(0, 8000) || '';

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
        linkCounts: crawlData.content.content.links,
        textContentSample: truncatedTextContent + (crawlData.content?.content?.textContent.length > 8000 ? '...' : '')
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

      const validScores = Object.values(scores).filter(s => typeof s === 'number' && s >= 0 && s <= 100);
      if (validScores.length > 1) {
          scores.overall = Math.round(
          scores.technical * weights.technical +
          scores.content * weights.content +
          scores.performance * weights.performance +
          scores.userExperience * weights.userExperience +
          scores.accessibility * weights.accessibility
        );
      }

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