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
    const language = data.language?.detected || 'en';
    const culturalContext = data.language?.culturalContext || {};

    const analysisPrompt = `
Based EXCLUSIVELY on the 'Webpage Data' provided below, provide BEGINNER-FRIENDLY, ACTIONABLE SEO guidance in ${language === 'en' ? 'English' : this.getLanguageName(language)}.

**LANGUAGE CONTEXT**: The website appears to be in ${this.getLanguageName(language)}. ALL recommendations, code examples, and suggested content MUST be provided in ${this.getLanguageName(language)} where applicable.

**TARGET AUDIENCE**: Assume the reader is a beginner who needs clear explanations. For each recommendation, explain WHY it matters for SEO.

Structure your response as a JSON with beginner-friendly categories:

{
  "quickWins": {
    "description": "Easy tasks anyone can do in 30 minutes that will improve SEO",
    "actions": [
      {
        "task": "Simple description of what to do",
        "whyItMatters": "Clear explanation of SEO benefit in simple terms",
        "howToDo": "Step-by-step instructions for beginners",
        "difficulty": "beginner",
        "timeNeeded": "15-30 minutes",
        "impact": "high|medium|low"
      }
    ]
  },
  "importantFixes": {
    "description": "Essential improvements that need attention within 1-2 weeks",
    "actions": [
      {
        "task": "What needs to be fixed",
        "whyItMatters": "Why this is important for SEO and user experience",
        "howToDo": "Detailed implementation steps",
        "difficulty": "intermediate",
        "timeNeeded": "1-4 hours",
        "impact": "high|medium|low",
        "codeExample": "Exact code to implement (if applicable)"
      }
    ]
  },
  "advancedOptimizations": {
    "description": "Long-term improvements for advanced users or developers",
    "actions": [
      {
        "task": "Advanced optimization task",
        "whyItMatters": "Technical SEO benefit explanation",
        "howToDo": "Technical implementation steps",
        "difficulty": "advanced",
        "timeNeeded": "4+ hours or ongoing",
        "impact": "high|medium|low",
        "technicalDetails": "Developer-specific information"
      }
    ]
  },
  "languageSpecific": {
    "detectedLanguage": "${language}",
    "recommendations": [
      {
        "task": "Language/culture-specific SEO advice",
        "localContext": "Why this matters for ${this.getLanguageName(language)} users",
        "implementation": "Specific steps considering cultural context"
      }
    ]
  }
}

**CRITICAL REQUIREMENTS:**
1. If title/meta description exists in ${this.getLanguageName(language)}, provide improved versions in the SAME language
2. Use culturally appropriate examples and references for ${this.getLanguageName(language)} users
3. Consider local search engines: ${culturalContext.searchEngines?.join(', ') || 'Google'}
4. Apply language-specific character limits: Title ${culturalContext.titleLength?.max || 60} chars, Meta Description ${culturalContext.metaDescLength?.max || 160} chars
5. Explain technical terms in simple language that beginners can understand

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
    const language = crawlData.language?.detected || 'en';
    const languageName = this.getLanguageName(language);

    const summaryPrompt = `
Based ONLY on the provided SEO analysis results, create a BEGINNER-FRIENDLY executive summary in ${languageName}.

**TARGET AUDIENCE**: Someone new to SEO who needs clear, simple explanations and prioritized action steps.

**LANGUAGE REQUIREMENT**: Write in ${languageName} if the website content is in ${languageName}, otherwise use English with ${languageName}-appropriate examples.

Create a summary with this exact structure:

**🎯 YOUR SEO SITUATION**
[1-2 sentences explaining current SEO health in simple terms]

**✅ QUICK WINS (Start Today - 30 minutes each)**
1. [Simple task anyone can do] → Why: [Simple explanation of benefit]
2. [Simple task anyone can do] → Why: [Simple explanation of benefit]
3. [Simple task anyone can do] → Why: [Simple explanation of benefit]

**⚠️ IMPORTANT FIXES (This Week - 1-2 hours each)**
1. [Essential fix needed] → Impact: [How this helps your website]
2. [Essential fix needed] → Impact: [How this helps your website]
3. [Essential fix needed] → Impact: [How this helps your website]

**🔧 BIGGER IMPROVEMENTS (Next Month)**
1. [Long-term optimization] → Benefit: [Why this matters long-term]
2. [Long-term optimization] → Benefit: [Why this matters long-term]

**📊 EXPECTED RESULTS**
If you complete the Quick Wins and Important Fixes, you should see: [Specific, realistic improvements]

**IMPORTANT**: Use simple language, avoid technical jargon, and explain WHY each action helps SEO.

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
    const language = crawlData.language?.detected || 'en';
    const languageName = this.getLanguageName(language);

    const recommendationsPrompt = `
Based ONLY on the following SEO analysis results, provide 5-10 BEGINNER-FRIENDLY recommendations in ${languageName}.

**TARGET AUDIENCE**: Beginners who need clear explanations and step-by-step guidance.

**LANGUAGE REQUIREMENT**: Provide all text examples, code snippets, and explanations in ${languageName} where applicable.

Structure each recommendation for different skill levels. Provide response in JSON format:

[
  {
    "difficulty": "beginner|intermediate|advanced",
    "priority": "high|medium|low",
    "category": "technical|content|performance|accessibility",
    "title": "Clear, simple description of what to do",
    "whyItMatters": "Simple explanation of why this helps SEO (for beginners)",
    "beginnerGuide": {
      "whatToDo": "Step-by-step instructions anyone can follow",
      "whereToFind": "Exactly where to make changes (e.g., 'In your website's admin panel')",
      "timeNeeded": "Realistic time estimate",
      "helpfulTips": "Additional guidance to avoid common mistakes"
    },
    "technicalDetails": {
      "code": "Exact HTML/CSS/JS code in ${languageName} (if applicable)",
      "implementation": "Technical steps for developers",
      "testingSteps": "How to verify the change worked"
    },
    "expectedOutcome": "Specific, measurable improvement they'll see",
    "impact": "high|medium|low",
    "effort": "low|medium|high"
  }
]

**CRITICAL REQUIREMENTS:**
1. All content examples (title tags, meta descriptions, etc.) must be in ${languageName}
2. Use beginner-friendly language - explain technical terms
3. Include specific, realistic expectations for results
4. Provide both beginner and technical guidance for each recommendation

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

    // Detect language from various sources
    const detectedLanguage = this.detectWebsiteLanguage(crawlData);

    return {
      url: crawlData.url,
      title: crawlData.content.title,
      description: crawlData.content.description,

      // Language context for AI analysis
      language: {
        detected: detectedLanguage.language,
        confidence: detectedLanguage.confidence,
        sources: detectedLanguage.sources,
        culturalContext: this.getCulturalSEOContext(detectedLanguage.language)
      },

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
   * Detect website language from multiple sources
   * @param {Object} crawlData - Raw crawl data
   * @returns {Object} Language detection result
   */
  detectWebsiteLanguage(crawlData) {
    const sources = [];
    let detectedLang = 'en'; // Default to English
    let confidence = 0.3; // Low confidence default

    // Check HTML lang attribute
    if (crawlData.content?.technical?.lang) {
      const htmlLang = crawlData.content.technical.lang.toLowerCase();
      if (htmlLang && htmlLang !== 'en') {
        detectedLang = htmlLang.split('-')[0]; // Get language code without region
        confidence = 0.9;
        sources.push('html-lang-attribute');
      }
    }

    // Analyze content language patterns
    const textContent = crawlData.content?.content?.textContent || '';
    const title = crawlData.content?.title || '';
    const description = crawlData.content?.description || '';

    const fullText = `${title} ${description} ${textContent}`.toLowerCase();

    // Simple language detection based on common words
    const languagePatterns = {
      'da': ['og', 'til', 'med', 'på', 'der', 'det', 'som', 'ikke', 'af', 'være'],
      'de': ['und', 'der', 'die', 'das', 'mit', 'auf', 'für', 'nicht', 'ist', 'werden'],
      'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
      'es': ['el', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no'],
      'it': ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'non'],
      'nl': ['de', 'het', 'van', 'en', 'in', 'op', 'voor', 'met', 'als', 'zijn'],
      'sv': ['och', 'att', 'det', 'på', 'av', 'för', 'till', 'med', 'om', 'så'],
      'no': ['og', 'at', 'det', 'på', 'av', 'for', 'til', 'med', 'om', 'så']
    };

    let highestScore = 0;
    let contentDetectedLang = 'en';

    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      const matches = patterns.filter(pattern => fullText.includes(` ${pattern} `)).length;
      const score = matches / patterns.length;

      if (score > highestScore && score > 0.3) {
        highestScore = score;
        contentDetectedLang = lang;
      }
    }

    // If content analysis suggests different language and confidence is higher
    if (highestScore > 0.5 && contentDetectedLang !== detectedLang) {
      detectedLang = contentDetectedLang;
      confidence = Math.min(0.8, highestScore);
      sources.push('content-analysis');
    }

    return {
      language: detectedLang,
      confidence: confidence,
      sources: sources.length > 0 ? sources : ['default-english']
    };
  }

  /**
   * Get cultural SEO context for a language
   * @param {string} language - Language code
   * @returns {Object} Cultural context
   */
  getCulturalSEOContext(language) {
    const contexts = {
      'da': {
        titleLength: { min: 30, max: 55, unit: 'characters' },
        metaDescLength: { min: 120, max: 155, unit: 'characters' },
        searchEngines: ['google.dk', 'bing.com'],
        culturalNotes: 'Danish users prefer direct, informative content. Local business information is highly valued.'
      },
      'de': {
        titleLength: { min: 30, max: 60, unit: 'characters' },
        metaDescLength: { min: 120, max: 160, unit: 'characters' },
        searchEngines: ['google.de', 'bing.de'],
        culturalNotes: 'German users appreciate detailed, authoritative content. Technical specifications are important.'
      },
      'fr': {
        titleLength: { min: 30, max: 60, unit: 'characters' },
        metaDescLength: { min: 120, max: 160, unit: 'characters' },
        searchEngines: ['google.fr', 'bing.fr'],
        culturalNotes: 'French users value elegant, well-structured content. Cultural references should be localized.'
      },
      'es': {
        titleLength: { min: 30, max: 60, unit: 'characters' },
        metaDescLength: { min: 120, max: 160, unit: 'characters' },
        searchEngines: ['google.es', 'google.com.mx', 'google.com.ar'],
        culturalNotes: 'Spanish content varies by region. Consider local dialects and cultural preferences.'
      }
    };

    return contexts[language] || {
      titleLength: { min: 30, max: 60, unit: 'characters' },
      metaDescLength: { min: 120, max: 160, unit: 'characters' },
      searchEngines: ['google.com'],
      culturalNotes: 'Standard international SEO practices apply.'
    };
  }

  /**
   * Get human-readable language name from language code
   * @param {string} languageCode - Language code (e.g., 'da', 'en')
   * @returns {string} Language name
   */
  getLanguageName(languageCode) {
    const languages = {
      'en': 'English',
      'da': 'Danish',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian'
    };

    return languages[languageCode] || 'English';
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