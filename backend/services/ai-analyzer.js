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

      // Enhanced JSON parsing with multiple extraction methods
      const parsedRecommendations = this.parseRecommendationsResponse(response);
      if (parsedRecommendations) {
        console.log(`Successfully parsed ${parsedRecommendations.length} recommendations`);
        return parsedRecommendations;
      }

      // Fallback: create properly structured recommendation from raw text
      console.warn('Could not parse JSON from recommendations, creating structured fallback');
      return this.createFallbackRecommendation(response);

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
   * Enhanced JSON parsing for AI recommendations with multiple extraction methods
   * @param {string} response - Raw AI response text
   * @returns {Array|null} Parsed recommendations or null if parsing fails
   */
  parseRecommendationsResponse(response) {
    if (!response || typeof response !== 'string') {
      console.log('Invalid response type:', typeof response);
      return null;
    }

    console.log('Parsing AI response, length:', response.length);

    // Method 1: Extract from markdown code blocks with better patterns
    const markdownExtractions = this.extractFromMarkdownCodeBlocks(response);
    if (markdownExtractions) {
      console.log('Successfully extracted from markdown code blocks');
      return markdownExtractions;
    }

    // Method 2: Extract complete JSON arrays (greedy matching)
    const arrayExtractions = this.extractCompleteJsonArrays(response);
    if (arrayExtractions) {
      console.log('Successfully extracted complete JSON arrays');
      return arrayExtractions;
    }

    // Method 3: Partial JSON recovery for truncated responses
    const partialExtractions = this.extractPartialJsonRecommendations(response);
    if (partialExtractions) {
      console.log('Successfully recovered from partial JSON');
      return partialExtractions;
    }

    // Method 4: Advanced line-by-line parsing
    const structuredExtractions = this.extractStructuredJsonByLines(response);
    if (structuredExtractions) {
      console.log('Successfully extracted via line-by-line parsing');
      return structuredExtractions;
    }

    console.log('All JSON extraction methods failed');
    return null;
  }

  /**
   * Extract JSON from markdown code blocks with improved patterns
   */
  extractFromMarkdownCodeBlocks(response) {
    // More comprehensive markdown patterns
    const patterns = [
      /```json\s*([\s\S]*?)\s*```/gi,      // Standard json blocks
      /```\s*([\s\S]*?)\s*```/gi,          // Generic code blocks
      /`([\s\S]*?)`/gi                     // Inline code
    ];

    for (const pattern of patterns) {
      const matches = [...response.matchAll(pattern)];
      for (const match of matches) {
        try {
          const content = match[1].trim();
          if (content.startsWith('[') && content.includes('{')) {
            // Try to fix common JSON issues
            const cleanedJson = this.cleanJsonContent(content);
            const parsed = JSON.parse(cleanedJson);

            if (Array.isArray(parsed) && this.validateRecommendationsStructure(parsed)) {
              return parsed;
            }
          }
        } catch (error) {
          console.log('Markdown extraction failed:', error.message);
          continue;
        }
      }
    }
    return null;
  }

  /**
   * Extract complete JSON arrays with greedy matching
   */
  extractCompleteJsonArrays(response) {
    // Greedy patterns for complete arrays
    const patterns = [
      /\[[\s\S]*\]/g,                      // Greedy array matching
      /\[[\s\S]*?\](?=\s*$)/g,            // Array to end of string
      /\[[\s\S]*?\](?=\s*\n\s*[^,\{\[])/g // Array followed by non-JSON content
    ];

    for (const pattern of patterns) {
      const matches = response.match(pattern);
      if (matches) {
        // Try the largest match first (most likely to be complete)
        const sortedMatches = matches.sort((a, b) => b.length - a.length);

        for (const match of sortedMatches) {
          try {
            const cleaned = this.cleanJsonContent(match);
            const parsed = JSON.parse(cleaned);

            if (Array.isArray(parsed) && this.validateRecommendationsStructure(parsed)) {
              return parsed;
            }
          } catch (error) {
            continue;
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract partial JSON recommendations from truncated responses
   */
  extractPartialJsonRecommendations(response) {
    // Find the start of JSON array
    const arrayStart = response.indexOf('[');
    if (arrayStart === -1) return null;

    // Extract everything from array start
    const jsonPortion = response.substring(arrayStart);

    // Try to extract complete recommendation objects even if array is incomplete
    const recommendations = [];
    let currentObject = '';
    let braceCount = 0;
    let inString = false;
    let inObject = false;

    for (let i = 0; i < jsonPortion.length; i++) {
      const char = jsonPortion[i];

      if (char === '"' && (i === 0 || jsonPortion[i-1] !== '\\')) {
        inString = !inString;
      }

      if (!inString) {
        if (char === '{') {
          if (!inObject) {
            inObject = true;
            currentObject = '';
          }
          braceCount++;
        } else if (char === '}') {
          braceCount--;
        }
      }

      if (inObject) {
        currentObject += char;

        // Complete object found
        if (braceCount === 0 && char === '}') {
          try {
            const parsed = JSON.parse(currentObject);
            if (this.validateSingleRecommendation(parsed)) {
              recommendations.push(parsed);
            }
          } catch (error) {
            console.log('Failed to parse individual recommendation:', error.message);
          }
          inObject = false;
          currentObject = '';
        }
      }
    }

    return recommendations.length > 0 ? recommendations : null;
  }

  /**
   * Extract structured JSON by analyzing lines
   */
  extractStructuredJsonByLines(response) {
    const lines = response.split('\n');
    let jsonStart = -1;
    let jsonEnd = -1;
    let bracketCount = 0;
    let braceCount = 0;

    // Find JSON boundaries more accurately
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('[') && jsonStart === -1) {
        jsonStart = i;
      }

      if (jsonStart !== -1) {
        // Count brackets and braces more carefully
        for (const char of line) {
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }

        // Found complete JSON structure
        if (bracketCount === 0 && braceCount === 0 && line.includes(']')) {
          jsonEnd = i;
          break;
        }
      }

      // If we seem to have left JSON territory, stop here
      if (jsonStart !== -1 && line.length > 0 && !line.match(/[\[\]{}",:\s]/)) {
        break;
      }
    }

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      try {
        const jsonText = lines.slice(jsonStart, jsonEnd + 1).join('\n');
        const cleaned = this.cleanJsonContent(jsonText);
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && this.validateRecommendationsStructure(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.log('Line-by-line extraction failed:', error.message);
      }
    }

    return null;
  }

  /**
   * Clean JSON content to fix common issues
   */
  cleanJsonContent(content) {
    return content
      .replace(/```json|```/g, '')                    // Remove markdown
      .replace(/\n\s*\n/g, '\n')                      // Remove empty lines
      .replace(/,(\s*[}\]])/g, '$1')                  // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')         // Quote unquoted keys
      .trim();
  }

  /**
   * Validate a single recommendation object
   */
  validateSingleRecommendation(rec) {
    return rec &&
           rec.title &&
           (rec.difficulty || rec.priority) &&
           (rec.whyItMatters || rec.description);
  }

  /**
   * Validate the structure of parsed recommendations
   * @param {Array} recommendations - Parsed recommendations array
   * @returns {boolean} True if structure is valid
   */
  validateRecommendationsStructure(recommendations) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return false;
    }

    // Check if it's the new beginner-friendly format or legacy format
    const firstRec = recommendations[0];

    // New format validation
    if (firstRec.difficulty && firstRec.whyItMatters && firstRec.beginnerGuide) {
      return recommendations.every(rec =>
        rec.title &&
        rec.whyItMatters &&
        (rec.difficulty === 'beginner' || rec.difficulty === 'intermediate' || rec.difficulty === 'advanced')
      );
    }

    // Legacy format validation
    if (firstRec.title && (firstRec.description || firstRec.implementation)) {
      return recommendations.every(rec => rec.title);
    }

    return false;
  }

  /**
   * Create a properly structured fallback recommendation from raw text
   * @param {string} rawResponse - Raw AI response
   * @returns {Array} Structured recommendation array
   */
  createFallbackRecommendation(rawResponse) {
    console.log('Creating fallback recommendations from raw response');

    // Method 1: Try to extract partial JSON objects from text
    const partialJsonRecs = this.extractPartialJsonFromText(rawResponse);
    if (partialJsonRecs.length > 0) {
      console.log('Extracted', partialJsonRecs.length, 'recommendations from partial JSON');
      return partialJsonRecs;
    }

    // Method 2: Parse structured text patterns
    const structuredRecs = this.extractStructuredRecommendations(rawResponse);
    if (structuredRecs.length > 0) {
      console.log('Extracted', structuredRecs.length, 'recommendations from structured text');
      return structuredRecs;
    }

    // Method 3: Look for obvious recommendation patterns
    const patternRecs = this.extractRecommendationSections(rawResponse);
    if (patternRecs.length > 0) {
      console.log('Extracted', patternRecs.length, 'recommendations from text patterns');
      return patternRecs.map((section, index) => ({
        difficulty: 'intermediate',
        priority: 'medium',
        category: 'general',
        title: section.title || `Recommendation ${index + 1}`,
        whyItMatters: section.why || section.description || 'This improvement will help your website\'s SEO performance.',
        beginnerGuide: {
          whatToDo: section.howTo || section.description || 'Please review the detailed analysis for specific steps.',
          whereToFind: 'Check your website\'s admin panel or content management system.',
          timeNeeded: '30-60 minutes',
          helpfulTips: 'Make sure to backup your website before making changes.'
        },
        technicalDetails: {
          implementation: section.technical || 'Consult with a developer if needed.',
          testingSteps: 'Test your changes and verify they work correctly.'
        },
        expectedOutcome: 'Improved SEO performance and user experience.',
        impact: 'medium',
        effort: 'medium'
      }));
    }

    // Last resort: create a single recommendation with cleaned text
    console.log('Creating single fallback recommendation');
    return [{
      difficulty: 'intermediate',
      priority: 'high',
      category: 'general',
      title: 'Review SEO Analysis Results',
      whyItMatters: 'The AI analysis contains important insights for improving your website\'s SEO.',
      beginnerGuide: {
        whatToDo: 'Please review the detailed analysis provided below for specific recommendations.',
        whereToFind: 'The full analysis is contained in the technical details section.',
        timeNeeded: '15-30 minutes to review',
        helpfulTips: 'Focus on the highest priority items first.'
      },
      technicalDetails: {
        implementation: this.cleanRawResponse(rawResponse),
        testingSteps: 'Implement recommendations gradually and test each change.'
      },
      expectedOutcome: 'Better understanding of your website\'s SEO opportunities.',
      impact: 'high',
      effort: 'low'
    }];
  }

  /**
   * Extract partial JSON objects from malformed text
   */
  extractPartialJsonFromText(text) {
    const recommendations = [];

    // Look for JSON-like structures with quoted keys
    const patterns = [
      /"difficulty":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"whyItMatters":\s*"([^"]*?)"/g,
      /"title":\s*"([^"]+)"[\s\S]*?"difficulty":\s*"([^"]+)"[\s\S]*?"whyItMatters":\s*"([^"]*?)"/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        try {
          // Extract the full object text around this match
          const objectText = this.extractObjectAroundMatch(text, match.index);
          const parsedRec = this.parsePartialJsonObject(objectText);

          if (parsedRec && this.validateSingleRecommendation(parsedRec)) {
            recommendations.push(parsedRec);
          }
        } catch (error) {
          console.log('Failed to extract partial JSON object:', error.message);
        }
      }
    }

    return recommendations;
  }

  /**
   * Extract full object text around a regex match
   */
  extractObjectAroundMatch(text, matchIndex) {
    // Find the start of object (look backwards for {)
    let start = matchIndex;
    while (start > 0 && text[start] !== '{') {
      start--;
    }

    // Find the end of object (look forwards for })
    let end = matchIndex;
    let braceCount = 0;
    let inString = false;

    for (let i = start; i < text.length; i++) {
      const char = text[i];

      if (char === '"' && (i === 0 || text[i-1] !== '\\')) {
        inString = !inString;
      }

      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            end = i + 1;
            break;
          }
        }
      }
    }

    return text.substring(start, end);
  }

  /**
   * Parse a partial JSON object with error recovery
   */
  parsePartialJsonObject(objectText) {
    try {
      // Try direct parsing first
      return JSON.parse(objectText);
    } catch (error) {
      // Try to fix common issues and parse again
      try {
        const cleaned = this.cleanJsonContent(objectText);
        return JSON.parse(cleaned);
      } catch (secondError) {
        // Extract key-value pairs manually
        return this.extractKeyValuePairs(objectText);
      }
    }
  }

  /**
   * Extract key-value pairs manually from malformed JSON-like text
   */
  extractKeyValuePairs(text) {
    const obj = {};

    // Common patterns for key-value extraction
    const patterns = [
      /"(\w+)":\s*"([^"]*?)"/g,          // "key": "value"
      /"(\w+)":\s*(\w+)/g,               // "key": value
      /(\w+):\s*"([^"]*?)"/g             // key: "value"
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const key = match[1];
        const value = match[2];

        if (!obj[key]) { // Don't overwrite existing values
          obj[key] = value;
        }
      }
    }

    // Create a valid recommendation structure
    return {
      difficulty: obj.difficulty || 'intermediate',
      priority: obj.priority || 'medium',
      category: obj.category || 'general',
      title: obj.title || 'SEO Improvement',
      whyItMatters: obj.whyItMatters || obj.description || 'This will improve your SEO.',
      beginnerGuide: {
        whatToDo: obj.whatToDo || 'Follow the implementation steps.',
        whereToFind: obj.whereToFind || 'Check your website settings.',
        timeNeeded: obj.timeNeeded || '30 minutes',
        helpfulTips: obj.helpfulTips || 'Test your changes carefully.'
      },
      technicalDetails: {
        implementation: obj.implementation || obj.code || 'See technical guidance.',
        testingSteps: obj.testingSteps || 'Verify the changes work correctly.'
      },
      expectedOutcome: obj.expectedOutcome || 'Improved SEO performance.',
      impact: obj.impact || 'medium',
      effort: obj.effort || 'medium'
    };
  }

  /**
   * Extract structured recommendations from readable text
   */
  extractStructuredRecommendations(text) {
    const recommendations = [];

    // Split text into logical sections
    const sections = text.split(/\n\s*\n|\n(?=\d+\.|\-|\*)/);

    for (const section of sections) {
      if (section.trim().length < 50) continue; // Skip very short sections

      const rec = this.parseTextSection(section);
      if (rec && rec.title) {
        recommendations.push(rec);
      }
    }

    return recommendations;
  }

  /**
   * Parse a text section into a recommendation object
   */
  parseTextSection(section) {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length === 0) return null;

    // Extract title (usually the first substantial line)
    const title = lines[0].replace(/^\d+\.\s*|\-\s*|\*\s*/, '').trim();

    // Look for specific information patterns
    const whyMatters = this.extractAfterPattern(section, /(why|matter|important|benefit)/i);
    const howTo = this.extractAfterPattern(section, /(how|step|implement|fix|do)/i);
    const code = this.extractCodeBlock(section);

    return {
      difficulty: 'intermediate',
      priority: 'medium',
      category: 'general',
      title: title.substring(0, 100),
      whyItMatters: whyMatters || 'This improvement will help your website\'s SEO.',
      beginnerGuide: {
        whatToDo: howTo || 'Follow the implementation guidance provided.',
        whereToFind: 'Check your website\'s admin panel or HTML code.',
        timeNeeded: '30-60 minutes',
        helpfulTips: 'Make a backup before making changes.'
      },
      technicalDetails: {
        implementation: howTo || 'See the detailed guidance above.',
        code: code,
        testingSteps: 'Test your changes and verify they work correctly.'
      },
      expectedOutcome: 'Improved SEO performance and user experience.',
      impact: 'medium',
      effort: 'medium'
    };
  }

  /**
   * Extract text after a pattern match
   */
  extractAfterPattern(text, pattern) {
    const match = text.match(pattern);
    if (match) {
      const afterMatch = text.substring(match.index + match[0].length);
      const firstSentence = afterMatch.split(/[.!?]/)[0];
      return firstSentence.trim().substring(0, 300);
    }
    return null;
  }

  /**
   * Extract code blocks from text
   */
  extractCodeBlock(text) {
    const codePatterns = [
      /```[\s\S]*?```/g,
      /`[^`]+`/g,
      /<[^>]+>/g
    ];

    for (const pattern of codePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].replace(/```|`/g, '').trim();
      }
    }
    return null;
  }

  /**
   * Extract recommendation sections from raw text
   * @param {string} text - Raw response text
   * @returns {Array} Array of extracted recommendation sections
   */
  extractRecommendationSections(text) {
    const sections = [];
    const lines = text.split('\n');

    // Look for numbered lists, bullet points, or clear recommendation patterns
    const patterns = [
      /^\d+\.\s*(.+)/,           // 1. Recommendation
      /^[-*]\s*(.+)/,            // - Recommendation or * Recommendation
      /^[A-Z][^.]*:\s*(.+)/,     // Title: Description
      /(?:recommendation|suggest|improve|fix|add|update|optimize):\s*(.+)/i
    ];

    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if this line starts a new recommendation
      const patternMatch = patterns.find(pattern => pattern.test(trimmed));
      if (patternMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed.replace(patternMatch, '$1').substring(0, 100),
          description: '',
          lines: [trimmed]
        };
      } else if (currentSection) {
        currentSection.lines.push(trimmed);
        if (trimmed.length > 20) {
          currentSection.description += ' ' + trimmed;
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.map(section => ({
      title: section.title,
      description: section.description.trim(),
      howTo: section.description.substring(0, 300),
      technical: section.lines.join('\n')
    }));
  }

  /**
   * Clean raw AI response for better display
   * @param {string} rawResponse - Raw response text
   * @returns {string} Cleaned response
   */
  cleanRawResponse(rawResponse) {
    return rawResponse
      .replace(/```json|```/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .substring(0, 2000); // Limit length for display
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