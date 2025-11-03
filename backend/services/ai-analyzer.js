/**
 * AI Analyzer Service
 * Handles AI-powered analysis using Anthropic Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');

/**
 * AI Analyzer Class
 * Provides comprehensive AI analysis capabilities using Anthropic Claude
 */
class AIAnalyzer {
  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY environment variable is required');
    }

    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Configuration
    this.modelName = "claude-3-haiku-20240307";
    this.maxTokens = 4096;
    this.temperature = 0.7;
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
      console.log(`🚀 Starting AI analysis for: ${crawlData.url}`);

      // Prepare structured data for analysis
      console.log('📊 Preparing structured data for analysis...');
      const structuredData = this.prepareDataForAnalysis(crawlData);

      // Execute analysis prompts
      const analysisResults = {};
      const promptResults = [];

      console.log(`📝 Executing ${prompts.length} analysis prompts...`);
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
          console.log(`✅ Completed prompt: ${prompt.name}`);
        } catch (error) {
          console.error(`❌ Failed to execute prompt ${prompt.name}:`, error.message);
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
      console.log('🔍 Generating comprehensive SEO analysis...');
      const comprehensiveAnalysis = await this.generateComprehensiveAnalysis(structuredData);
      console.log('✅ Comprehensive analysis complete');

      // Calculate SEO validation scores
      console.log('📊 Calculating SEO validation scores...');
      const seoValidation = this.calculateSEOValidationScores(crawlData);
      const priorityMatrix = this.generateSEOPriorityMatrix(seoValidation);
      console.log('✅ SEO validation complete');

      // Calculate analysis duration
      const analysisTime = Date.now() - startTime;

      console.log('📝 Generating summary and recommendations...');
      let summary, recommendations;

      try {
        summary = await this.generateSummary(crawlData, comprehensiveAnalysis);
        console.log('✅ Summary generated successfully');
      } catch (error) {
        console.error('❌ Summary generation failed:', error.message);
        summary = 'Summary generation failed. Please review the detailed analysis below.';
      }

      try {
        recommendations = await this.generateRecommendations(crawlData, comprehensiveAnalysis);
        console.log(`✅ Generated ${recommendations.length} recommendations`);
      } catch (error) {
        console.error('❌ Recommendations generation failed:', error.message);
        recommendations = [];
      }

      const result = {
        url: crawlData.url,
        analyzedAt: new Date().toISOString(),
        analysisTime: analysisTime,

        // Prompt-based results
        promptResults: promptResults,
        promptAnalyses: analysisResults,

        // Comprehensive analysis
        comprehensiveAnalysis: comprehensiveAnalysis,

        // SEO validation and scoring
        seoValidation: seoValidation,
        priorityMatrix: priorityMatrix,

        // SEO scores and metrics
        seoScores: this.calculateSEOScores(crawlData, comprehensiveAnalysis),

        // Summary and recommendations
        summary: summary,
        recommendations: recommendations
      };

      console.log(`✅ AI analysis completed in ${analysisTime}ms with ${recommendations.length} recommendations`);
      return result;

    } catch (error) {
      console.error('❌ AI analysis failed:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`AI analysis failed: ${error.message}`);
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

      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      });

      const text = message.content[0].text;

      return {
        content: text,
        finishReason: message.stop_reason || 'end_turn',
        usage: {
          promptTokens: message.usage.input_tokens || 0,
          completionTokens: message.usage.output_tokens || 0,
          totalTokens: (message.usage.input_tokens || 0) + (message.usage.output_tokens || 0)
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
You are a senior SEO consultant with 10+ years of experience analyzing websites. Based EXCLUSIVELY on the 'Webpage Data' provided below, provide EXPERT-LEVEL, IMPLEMENTABLE SEO recommendations in ${language === 'en' ? 'English' : this.getLanguageName(language)}.

**WEBSITE BEING ANALYZED**: ${data.url}

**LANGUAGE CONTEXT**: The website appears to be in ${this.getLanguageName(language)}. ALL recommendations, code examples, and suggested content MUST be provided in ${this.getLanguageName(language)} where applicable.

**CRITICAL SEO ANALYSIS REQUIREMENTS**:
1. Provide SPECIFIC, IMPLEMENTABLE recommendations based on ACTUAL content found
2. Include EXACT HTML code examples using the website's real content
3. Give CONCRETE explanations of WHY each optimization matters for rankings
4. Reference SPECIFIC elements found on the page (exact titles, headings, images, etc.)
5. Provide MEASURABLE outcomes with realistic timelines (e.g., "15-30% CTR increase in 4-6 weeks")
6. Include COMPETITOR-BEATING strategies based on current content gaps
7. Address CORE WEB VITALS and TECHNICAL SEO issues with specific fixes
8. Provide LOCAL SEO recommendations if business location detected
9. Include MOBILE-FIRST optimizations with specific implementation steps
10. Give CONTENT OPTIMIZATION with exact word count targets and keyword placement

**SEO BENCHMARKS TO REFERENCE**:
- Title tags: 30-60 characters (50-55 optimal)
- Meta descriptions: 120-160 characters (150-155 optimal)
- H1 tags: 1 per page, 20-70 characters
- H2-H6: Clear hierarchy with target keywords
- Image alt text: Descriptive, 125 characters max
- Internal links: 2-5 contextual links per 1000 words
- Page speed: <2.5s load time, LCP <2.5s, FID <100ms, CLS <0.1
- Content length: 1000+ words for competitive keywords

Structure your response as a JSON with these SPECIFIC SEO categories:

{
  "currentPageAnalysis": {
    "url": "${data.url}",
    "currentTitle": "Exact current title found",
    "titleAnalysis": "Professional analysis of current title including length, keywords, and optimization opportunities",
    "currentMetaDescription": "Exact current meta description or 'Missing' if none found",
    "metaDescriptionAnalysis": "Professional analysis including character count and optimization suggestions",
    "performanceInsights": "Analysis of load times and Core Web Vitals if available"
  },
  "criticalSEOIssues": {
    "description": "CRITICAL SEO problems that are harming rankings RIGHT NOW",
    "issues": [
      {
        "issue": "Specific SEO problem found on the page",
        "currentProblem": "Exact current state causing SEO harm",
        "seoImpact": "Specific ranking/traffic impact (e.g., '25-40% potential traffic loss')",
        "immediateAction": "EXACT steps to fix this now",
        "htmlCode": "Complete HTML code to implement (copy-paste ready)",
        "expectedImprovement": "Measurable outcome (e.g., '15-30% CTR increase in 3-4 weeks')",
        "timeToImplement": "Minutes/hours needed",
        "difficultyLevel": "beginner|intermediate|advanced",
        "priority": "critical|high|medium|low"
      }
    ]
  },
  "quickWinOptimizations": {
    "description": "Fast SEO improvements that deliver results in 1-4 weeks",
    "optimizations": [
      {
        "optimization": "Specific quick-win opportunity",
        "currentContent": "What's currently on the page",
        "optimizedContent": "EXACT replacement content",
        "implementation": "Step-by-step implementation guide",
        "codeSnippet": "Ready-to-use HTML/CSS/JS code",
        "keywordTarget": ["specific", "keywords", "targeted"],
        "expectedResults": "Measurable improvement timeline",
        "competitiveAdvantage": "How this beats competitors",
        "validationSteps": "How to verify implementation worked"
      }
    ]
  },
  "contentOptimizations": {
    "description": "STRATEGIC content improvements to dominate search results",
    "strategies": [
      {
        "contentArea": "Specific content section to optimize",
        "currentWordCount": "Actual current word count",
        "targetWordCount": "Optimal word count for competitive keywords",
        "keywordGaps": ["Missing keywords competitors rank for"],
        "contentStructure": "Exact heading structure to implement (H1, H2, H3 with keywords)",
        "contentToAdd": "Specific content sections/paragraphs to add",
        "internalLinkingPlan": "Exact internal links to add with anchor text",
        "competitorAnalysis": "What top-ranking pages have that this page lacks",
        "implementation": "Step-by-step content expansion plan",
        "expectedRankingImprovement": "Projected SERP position improvement",
        "timeline": "Realistic timeline for content production and results"
      }
    ]
  },
  "technicalSEOFixes": {
    "description": "CRITICAL technical SEO issues that must be fixed for better rankings",
    "fixes": [
      {
        "technicalIssue": "Specific technical SEO problem found",
        "currentState": "What's currently wrong technically",
        "seoHarm": "How this hurts search engine rankings",
        "fixImplementation": "EXACT technical steps to resolve",
        "codeToImplement": "Complete, copy-paste ready code solution",
        "testingMethod": "How to verify the fix worked",
        "toolsNeeded": "Specific tools/plugins required (if any)",
        "developmentTime": "Realistic development time estimate",
        "seoImprovement": "Expected ranking/traffic improvement",
        "coreWebVitalsImpact": "Effect on LCP, FID, CLS scores"
      }
    ]
  },
  "competitiveAdvantages": {
    "description": "STRATEGIC opportunities to outrank competitors and dominate search results",
    "opportunities": [
      {
        "competitiveGap": "Specific gap this site has vs top-ranking competitors",
        "opportunitySize": "Traffic/revenue potential (e.g., '500-1000 monthly visitors')",
        "implementationPlan": "Exact steps to exploit this competitive advantage",
        "contentStrategy": "Specific content to create/optimize to beat competitors",
        "keywordTargets": ["High-value keywords competitors miss"],
        "technicalAdvantage": "Technical SEO improvements competitors lack",
        "linkBuildingAngle": "Specific link-earning opportunities",
        "expectedRanking": "Projected SERP position after implementation",
        "competitiveAnalysis": "What top 3 competitors are doing wrong",
        "executionTimeline": "Month-by-month implementation plan",
        "successMetrics": "Specific KPIs to track competitive gains"
      }
    ]
  },
  "coreWebVitalsOptimization": {
    "description": "CRITICAL page speed fixes to improve Core Web Vitals and search rankings",
    "optimizations": [
      {
        "vitalMetric": "Specific Core Web Vital (LCP, FID, CLS)",
        "currentScore": "Actual measured score if available",
        "targetScore": "Google-recommended target score",
        "performanceIssue": "Specific issue causing poor performance",
        "technicalFix": "EXACT technical steps to improve this metric",
        "codeImplementation": "Complete code solution to implement",
        "imageOptimization": "Specific image files to compress/optimize",
        "loadingStrategy": "Lazy loading, preloading strategies to implement",
        "expectedImprovement": "Projected score improvement (e.g., 'LCP from 4.2s to 2.1s')",
        "seoRankingImpact": "Expected ranking improvement from speed gains",
        "implementationPriority": "critical|high|medium",
        "developmentEffort": "Hours/days needed for implementation"
      }
    ]
  },
  "measurableOutcomes": {
    "description": "SPECIFIC, trackable improvements with realistic timelines and success metrics",
    "outcomes": [
      {
        "kpiMetric": "Specific SEO metric to track",
        "currentBaseline": "Current measured value",
        "targetImprovement": "Specific improvement goal with percentage/number",
        "timelineToResults": "Realistic timeline (e.g., '4-8 weeks for initial results')",
        "trackingTools": "Specific tools to use for measurement (Google Analytics, Search Console, etc.)",
        "validationMethod": "How to verify improvements are from these optimizations",
        "revenueImpact": "Potential business impact if applicable",
        "competitiveBenchmark": "How this compares to industry standards"
      }
    ]
  },
  "implementationRoadmap": {
    "description": "PRIORITIZED action plan with exact implementation order",
    "phases": [
      {
        "phase": "Phase 1: Critical Fixes (Week 1-2)",
        "actions": ["List of highest priority actions in order"],
        "expectedImpact": "Immediate SEO improvements expected",
        "resourcesNeeded": "Time, tools, or expertise required"
      },
      {
        "phase": "Phase 2: Quick Wins (Week 3-6)",
        "actions": ["List of quick win optimizations"],
        "expectedImpact": "Short-term ranking and traffic improvements",
        "resourcesNeeded": "Time, tools, or expertise required"
      },
      {
        "phase": "Phase 3: Strategic Growth (Month 2-3)",
        "actions": ["List of longer-term strategic improvements"],
        "expectedImpact": "Long-term competitive advantages",
        "resourcesNeeded": "Time, tools, or expertise required"
      }
    ]
  }
}

**CRITICAL IMPLEMENTATION REQUIREMENTS:**
1. Use ACTUAL content from the webpage in ALL examples and recommendations
2. Provide SPECIFIC, MEASURABLE outcomes with realistic timelines for each recommendation
3. Include EXACT HTML/CSS/JS code examples using the website's real content - ready to copy and paste
4. Reference SPECIFIC elements found on the page (actual titles, headings, images, URLs, etc.)
5. Give PROFESSIONAL explanations that justify ROI to business decision-makers
6. Consider local search engines: ${culturalContext.searchEngines?.join(', ') || 'Google'}
7. Apply STRICT character limits: Title ${culturalContext.titleLength?.max || 60} chars, Meta Description ${culturalContext.metaDescLength?.max || 160} chars
8. Include PERFORMANCE insights with specific Core Web Vitals improvements if data available
9. Provide COMPETITIVE advantage insights based on content gaps vs top-ranking pages
10. ALL recommendations MUST be actionable with step-by-step implementation guides
11. Include PRIORITY levels (critical/high/medium/low) for each recommendation
12. Provide DIFFICULTY levels (beginner/intermediate/advanced) for implementation
13. Include RESOURCE requirements (time, tools, expertise needed)
14. Give VALIDATION methods to verify each optimization worked
15. Provide TRACKING methods to measure success of each change

**BILINGUAL OUTPUT REQUIREMENTS:**
- ALL explanations, action plans, and business reasoning: English
- Content recommendations (titles, meta descriptions, headings): ${this.getLanguageName(language)}
- Code examples: Preserve original special characters (ø, æ, å, ü, ß, é, etc.) EXACTLY
- Technical terms: English with examples in source language

**CHARACTER ENCODING**:
- CRITICAL: Preserve ALL Unicode characters including ø, æ, å, ü, ß, é, ç, ñ, etc.
- Never replace or transliterate special characters
- Maintain exact character representation in all outputs

**PERFORMANCE DATA** (if available):
- Load Time: ${data.performance?.loadTime || 'Not measured'}ms
- Core Web Vitals: LCP: ${data.performance?.coreWebVitals?.lcp || 'Not measured'}, FID: ${data.performance?.coreWebVitals?.fid || 'Not measured'}, CLS: ${data.performance?.coreWebVitals?.cls || 'Not measured'}
- Performance Score: ${data.performance?.scores?.performance || 'Not calculated'}/100

Webpage Data:
${JSON.stringify(data, null, 2)}
`;

    try {
      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      });

      const response = message.content[0].text;

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
Based ONLY on the provided SEO analysis results, create a BEGINNER-FRIENDLY executive summary.

**TARGET AUDIENCE**: Someone new to SEO who needs clear, simple explanations and prioritized action steps.

**BILINGUAL LANGUAGE REQUIREMENTS**:
- ALL explanations and action steps: English (for international understanding)
- Content examples (titles, descriptions): ${languageName} with exact special characters
- Preserve Unicode characters (ø, æ, å, ü, ß, é, etc.) in all content examples

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
      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 1024,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: summaryPrompt
          }
        ]
      });

      return message.content[0].text;

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
Based ONLY on the following SEO analysis results, provide 5-10 BEGINNER-FRIENDLY recommendations.

**TARGET AUDIENCE**: Beginners who need clear explanations and step-by-step guidance.

**BILINGUAL REQUIREMENTS**:
- Explanations and instructions: English (for clarity and international use)
- Content examples (titles, meta descriptions, headings): ${languageName}
- Code snippets: Preserve original special characters (ø, æ, å, ü, ß, é, etc.) EXACTLY
- Never transliterate or replace Unicode characters

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
      console.log('🤖 Generating AI recommendations...');
      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: recommendationsPrompt
          }
        ]
      });

      const response = message.content[0].text;
      console.log('📝 AI response received, length:', response.length);
      console.log('📄 First 500 chars of response:', response.substring(0, 500));

      // Enhanced JSON parsing with multiple extraction methods
      const parsedRecommendations = this.parseRecommendationsResponse(response);
      if (parsedRecommendations && Array.isArray(parsedRecommendations) && parsedRecommendations.length > 0) {
        console.log(`✅ Successfully parsed ${parsedRecommendations.length} recommendations`);
        return parsedRecommendations;
      }

      // Fallback: create properly structured recommendation from raw text
      console.warn('⚠️ Could not parse JSON from recommendations, creating structured fallback');
      console.log('📄 Full AI response for debugging:', response);
      const fallbackRecs = this.createFallbackRecommendation(response);
      console.log(`✅ Created ${fallbackRecs.length} fallback recommendations`);
      return fallbackRecs;

    } catch (error) {
      console.error('❌ Recommendations generation failed:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      // Return empty array to prevent analysis from failing completely
      return [];
    }
  }

  /**
   * Validate and preserve character encoding
   * @param {string} text - Text to validate
   * @returns {Object} Validation result with preserved text
   */
  validateCharacterEncoding(text) {
    if (!text || typeof text !== 'string') {
      return { isValid: true, text: text || '', hasSpecialChars: false };
    }

    // Check for special characters
    const specialChars = /[øæåüßéèçàáíóúñ]/gi;
    const hasSpecialChars = specialChars.test(text);

    // Check for proper UTF-8 encoding (no replacement characters)
    const hasReplacementChars = /\uFFFD/.test(text);
    const isValid = !hasReplacementChars;

    if (!isValid) {
      console.warn('Character encoding issues detected in text:', text.substring(0, 100));
    }

    return {
      isValid,
      text,
      hasSpecialChars,
      characterCount: text.length,
      encoding: 'UTF-8'
    };
  }

  /**
   * Prepare crawl data for AI analysis with character validation
   * @param {Object} crawlData - Raw crawl data
   * @returns {Object} Structured data for analysis
   */
  prepareDataForAnalysis(crawlData) {
    // Validate character encoding for key text fields
    const titleValidation = this.validateCharacterEncoding(crawlData.content?.title);
    const descriptionValidation = this.validateCharacterEncoding(crawlData.content?.description);
    const textContentValidation = this.validateCharacterEncoding(crawlData.content?.textContent);

    // Log encoding issues
    if (!titleValidation.isValid || !descriptionValidation.isValid || !textContentValidation.isValid) {
      console.warn('Character encoding validation failed for some content fields');
    }

    // Truncate the full text content to a reasonable length to avoid overly large prompts
    const truncatedTextContent = crawlData.content?.content?.textContent.substring(0, 8000) || '';

    // Detect language from various sources
    const detectedLanguage = this.detectWebsiteLanguage(crawlData);

    return {
      url: crawlData.url,
      title: titleValidation.text,
      description: descriptionValidation.text,

      // Character encoding metadata
      encoding: {
        isValid: titleValidation.isValid && descriptionValidation.isValid && textContentValidation.isValid,
        hasSpecialChars: titleValidation.hasSpecialChars || descriptionValidation.hasSpecialChars || textContentValidation.hasSpecialChars,
        charset: crawlData.content?.charset || 'UTF-8',
        validation: {
          title: titleValidation,
          description: descriptionValidation,
          content: textContentValidation
        }
      },

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
        textContentSample: textContentValidation.text.substring(0, 8000) + (textContentValidation.text.length > 8000 ? '...' : '')
      },

      // Technical SEO
      technical: crawlData.content.technical,

      // Performance data
      performance: {
        loadTime: crawlData.loadTime,
        resourceCounts: crawlData.performance?.resources,
        coreWebVitals: crawlData.performance?.coreWebVitals || {},
        scores: crawlData.performance?.scores || {},
        metrics: crawlData.performance?.metrics || {}
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

    // Enhanced language detection with special characters
    const languagePatterns = {
      'da': [
        // Common Danish words
        'og', 'til', 'med', 'på', 'der', 'det', 'som', 'ikke', 'af', 'være',
        // Danish words with special characters
        'køb', 'år', 'både', 'når', 'før', 'så', 'større', 'første', 'øl', 'hør', 'død',
        'æbler', 'lærer', 'sælger', 'værd', 'færdig', 'træ', 'kær', 'bær',
        'få', 'gå', 'stå', 'små', 'blå', 'grå', 'nå', 'må', 'kål', 'rød', 'brød'
      ],
      'de': [
        // Common German words
        'und', 'der', 'die', 'das', 'mit', 'auf', 'für', 'nicht', 'ist', 'werden',
        // German words with special characters
        'über', 'können', 'müssen', 'größer', 'weiß', 'heiß', 'straße', 'schön',
        'mögen', 'fühlen', 'früh', 'grün', 'natürlich', 'größe', 'prüfen'
      ],
      'fr': [
        // Common French words
        'le', 'de', 'et', 'à', 'un', 'il', 'être', 'en', 'avoir',
        // French words with special characters
        'français', 'très', 'après', 'où', 'même', 'déjà', 'été', 'voilà',
        'préférer', 'créer', 'première', 'dernière', 'société', 'années'
      ],
      'es': [
        // Common Spanish words
        'el', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no',
        // Spanish words with special characters
        'también', 'más', 'después', 'sólo', 'años', 'país', 'así',
        'información', 'educación', 'situación', 'población', 'español'
      ],
      'it': [
        // Common Italian words
        'il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'non',
        // Italian words with special characters
        'più', 'già', 'così', 'però', 'città', 'perché', 'società',
        'università', 'attività', 'qualità', 'possibilità'
      ],
      'nl': [
        // Common Dutch words
        'de', 'het', 'van', 'en', 'in', 'op', 'voor', 'met', 'als', 'zijn',
        // Dutch words with special characters (limited special chars in Dutch)
        'één', 'beëindigen', 'coördinatie', 'België', 'café'
      ],
      'sv': [
        // Common Swedish words
        'och', 'att', 'det', 'på', 'av', 'för', 'till', 'med', 'om', 'så',
        // Swedish words with special characters
        'är', 'när', 'här', 'där', 'år', 'två', 'få', 'små', 'kön', 'hör',
        'större', 'första', 'många', 'väl', 'rätt', 'längre', 'förstå'
      ],
      'no': [
        // Common Norwegian words
        'og', 'at', 'det', 'på', 'av', 'for', 'til', 'med', 'om', 'så',
        // Norwegian words with special characters
        'år', 'både', 'når', 'før', 'større', 'første', 'få', 'små', 'høy',
        'røy', 'blå', 'grå', 'små', 'stå', 'gå', 'må', 'nå'
      ]
    };

    // Special character patterns for language detection boost
    const specialCharPatterns = {
      'da': /[øæå]/gi,
      'de': /[üßö]/gi,
      'fr': /[éèçàáî]/gi,
      'es': /[ñáéíóú]/gi,
      'it': /[àéèìíîòóù]/gi,
      'sv': /[åäö]/gi,
      'no': /[øæå]/gi
    };

    let highestScore = 0;
    let contentDetectedLang = 'en';

    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      let matches = patterns.filter(pattern => fullText.includes(` ${pattern} `)).length;
      let score = matches / patterns.length;

      // Boost score for special characters presence
      if (specialCharPatterns[lang]) {
        const specialCharMatches = (fullText.match(specialCharPatterns[lang]) || []).length;
        const titleSpecialChars = (title.match(specialCharPatterns[lang]) || []).length;
        const descSpecialChars = (description.match(specialCharPatterns[lang]) || []).length;

        // Significant boost for special characters, especially in title/description
        const specialCharBoost = (specialCharMatches * 0.1) + (titleSpecialChars * 0.3) + (descSpecialChars * 0.2);
        score += specialCharBoost;
      }

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
    console.log('📦 Creating fallback recommendations from raw response');

    // Method 1: Try to extract partial JSON objects from text
    try {
      const partialJsonRecs = this.extractPartialJsonFromText(rawResponse);
      if (partialJsonRecs.length > 0) {
        console.log(`✅ Extracted ${partialJsonRecs.length} recommendations from partial JSON`);
        // Validate each recommendation
        const validated = this.ensureRecommendationsValid(partialJsonRecs);
        if (validated.length > 0) return validated;
      }
    } catch (error) {
      console.warn('⚠️ Partial JSON extraction failed:', error.message);
    }

    // Method 2: Parse structured text patterns
    try {
      const structuredRecs = this.extractStructuredRecommendations(rawResponse);
      if (structuredRecs.length > 0) {
        console.log(`✅ Extracted ${structuredRecs.length} recommendations from structured text`);
        const validated = this.ensureRecommendationsValid(structuredRecs);
        if (validated.length > 0) return validated;
      }
    } catch (error) {
      console.warn('⚠️ Structured text extraction failed:', error.message);
    }

    // Method 3: Look for obvious recommendation patterns
    try {
      const patternRecs = this.extractRecommendationSections(rawResponse);
      if (patternRecs.length > 0) {
        console.log(`✅ Extracted ${patternRecs.length} recommendations from text patterns`);
        const mapped = patternRecs.map((section, index) => ({
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
        const validated = this.ensureRecommendationsValid(mapped);
        if (validated.length > 0) return validated;
      }
    } catch (error) {
      console.warn('⚠️ Pattern extraction failed:', error.message);
    }

    // Last resort: create a guaranteed valid recommendation with cleaned text
    console.log('📦 Creating guaranteed fallback recommendation');
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
   * Ensure recommendations array is valid and properly structured
   * @param {Array} recommendations - Recommendations to validate
   * @returns {Array} Valid recommendations
   */
  ensureRecommendationsValid(recommendations) {
    if (!Array.isArray(recommendations)) {
      console.warn('⚠️ Recommendations is not an array');
      return [];
    }

    const valid = recommendations.filter(rec => {
      // Must have title
      if (!rec || !rec.title) return false;

      // Must have required structure
      if (!rec.difficulty || !rec.whyItMatters) {
        // Try to fix missing fields
        rec.difficulty = rec.difficulty || 'intermediate';
        rec.priority = rec.priority || 'medium';
        rec.category = rec.category || 'general';
        rec.whyItMatters = rec.whyItMatters || 'This will improve your SEO.';
        rec.impact = rec.impact || 'medium';
        rec.effort = rec.effort || 'medium';
        rec.expectedOutcome = rec.expectedOutcome || 'Improved SEO performance.';

        // Ensure nested objects exist
        if (!rec.beginnerGuide || typeof rec.beginnerGuide !== 'object') {
          rec.beginnerGuide = {
            whatToDo: 'Follow the implementation steps.',
            whereToFind: 'Check your website settings.',
            timeNeeded: '30 minutes',
            helpfulTips: 'Test your changes carefully.'
          };
        }

        if (!rec.technicalDetails || typeof rec.technicalDetails !== 'object') {
          rec.technicalDetails = {
            implementation: 'See detailed guidance.',
            testingSteps: 'Verify changes work correctly.'
          };
        }
      }

      return true;
    });

    console.log(`✅ Validated ${valid.length} of ${recommendations.length} recommendations`);
    return valid;
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
   * Calculate comprehensive SEO validation scores
   * @param {Object} crawlData - Crawl data to analyze
   * @returns {Object} SEO validation results
   */
  calculateSEOValidationScores(crawlData) {
    const validation = {
      titleTag: this.validateTitleTag(crawlData.content?.title),
      metaDescription: this.validateMetaDescription(crawlData.content?.description),
      headingStructure: this.validateHeadingStructure(crawlData.content?.headings),
      contentLength: this.validateContentLength(crawlData.content?.content?.wordCount),
      imageOptimization: this.validateImageOptimization(crawlData.content?.images),
      internalLinking: this.validateInternalLinking(crawlData.content?.content?.links),
      technicalSEO: this.validateTechnicalSEO(crawlData.content?.technical),
      overallScore: 0
    };

    // Calculate overall score
    const scores = Object.values(validation).filter(v => typeof v === 'object' && v.score !== undefined);
    validation.overallScore = Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length);

    return validation;
  }

  /**
   * Validate title tag optimization
   * @param {string} title - Page title
   * @returns {Object} Title validation result
   */
  validateTitleTag(title) {
    const validation = {
      score: 0,
      length: title ? title.length : 0,
      issues: [],
      recommendations: []
    };

    if (!title) {
      validation.issues.push('Missing title tag');
      validation.recommendations.push('Add a descriptive title tag with primary keywords');
      return validation;
    }

    // Length validation
    if (title.length < 30) {
      validation.issues.push('Title too short (less than 30 characters)');
      validation.recommendations.push('Expand title to 50-60 characters for optimal SEO');
      validation.score += 20;
    } else if (title.length > 60) {
      validation.issues.push('Title too long (more than 60 characters)');
      validation.recommendations.push('Shorten title to 50-60 characters to prevent truncation');
      validation.score += 60;
    } else {
      validation.score += 100;
    }

    // Additional checks
    if (title.toLowerCase().includes('untitled') || title.toLowerCase().includes('new page')) {
      validation.issues.push('Generic or placeholder title detected');
      validation.recommendations.push('Replace with specific, keyword-rich title');
      validation.score = Math.min(validation.score, 30);
    }

    return validation;
  }

  /**
   * Validate meta description optimization
   * @param {string} description - Meta description
   * @returns {Object} Meta description validation result
   */
  validateMetaDescription(description) {
    const validation = {
      score: 0,
      length: description ? description.length : 0,
      issues: [],
      recommendations: []
    };

    if (!description) {
      validation.issues.push('Missing meta description');
      validation.recommendations.push('Add compelling meta description with call-to-action');
      return validation;
    }

    // Length validation
    if (description.length < 120) {
      validation.issues.push('Meta description too short (less than 120 characters)');
      validation.recommendations.push('Expand to 150-160 characters for maximum SERP visibility');
      validation.score += 50;
    } else if (description.length > 160) {
      validation.issues.push('Meta description too long (more than 160 characters)');
      validation.recommendations.push('Shorten to 150-160 characters to prevent truncation');
      validation.score += 70;
    } else {
      validation.score += 100;
    }

    // Content quality checks
    const hasCallToAction = /\b(learn more|discover|find out|get|try|start|book|contact|call|visit|shop|buy)\b/i.test(description);
    if (!hasCallToAction) {
      validation.issues.push('Missing call-to-action in meta description');
      validation.recommendations.push('Add compelling call-to-action to improve CTR');
      validation.score = Math.max(validation.score - 20, 0);
    }

    return validation;
  }

  /**
   * Validate heading structure (H1-H6)
   * @param {Array} headings - Array of headings
   * @returns {Object} Heading validation result
   */
  validateHeadingStructure(headings) {
    const validation = {
      score: 0,
      issues: [],
      recommendations: [],
      hierarchy: {}
    };

    // Check if headings exists and has data
    if (!headings) {
      validation.issues.push('No headings found');
      validation.recommendations.push('Add proper heading structure (H1, H2, H3) with target keywords');
      return validation;
    }

    // Handle object structure: {h1: [], h2: [], h3: [], ...} (from crawler)
    if (typeof headings === 'object' && !Array.isArray(headings)) {
      let totalHeadings = 0;
      Object.keys(headings).forEach(level => {
        const count = Array.isArray(headings[level]) ? headings[level].length : 0;
        validation.hierarchy[level] = count;
        totalHeadings += count;
      });

      // Check if there are any headings at all
      if (totalHeadings === 0) {
        validation.issues.push('No headings found');
        validation.recommendations.push('Add proper heading structure (H1, H2, H3) with target keywords');
        return validation;
      }
    }
    // Handle array structure: [{level: 1, text: "..."}, ...] (legacy/alternative format)
    else if (Array.isArray(headings)) {
      if (headings.length === 0) {
        validation.issues.push('No headings found');
        validation.recommendations.push('Add proper heading structure (H1, H2, H3) with target keywords');
        return validation;
      }

      headings.forEach(heading => {
        const level = `h${heading.level}`;
        validation.hierarchy[level] = (validation.hierarchy[level] || 0) + 1;
      });
    } else {
      // Unexpected format
      validation.issues.push('Invalid heading data structure');
      return validation;
    }

    // H1 validation
    if (!validation.hierarchy.h1) {
      validation.issues.push('Missing H1 tag');
      validation.recommendations.push('Add single H1 tag with primary keyword');
      validation.score = 0;
    } else if (validation.hierarchy.h1 > 1) {
      validation.issues.push('Multiple H1 tags found');
      validation.recommendations.push('Use only one H1 tag per page for best SEO');
      validation.score = 40;
    } else {
      validation.score = 80;
    }

    // Structure validation
    const hasH2 = validation.hierarchy.h2 > 0;
    const hasH3 = validation.hierarchy.h3 > 0;

    if (!hasH2) {
      validation.issues.push('Missing H2 subheadings');
      validation.recommendations.push('Add H2 subheadings to improve content structure');
      validation.score = Math.max(validation.score - 20, 0);
    }

    if (hasH3 && !hasH2) {
      validation.issues.push('H3 used without H2 (improper hierarchy)');
      validation.recommendations.push('Maintain proper heading hierarchy (H1 > H2 > H3)');
      validation.score = Math.max(validation.score - 15, 0);
    }

    if (validation.score > 60) validation.score = 100;

    return validation;
  }

  /**
   * Validate content length and quality
   * @param {number} wordCount - Content word count
   * @returns {Object} Content validation result
   */
  validateContentLength(wordCount) {
    const validation = {
      score: 0,
      wordCount: wordCount || 0,
      issues: [],
      recommendations: []
    };

    if (!wordCount || wordCount < 300) {
      validation.issues.push('Insufficient content length (less than 300 words)');
      validation.recommendations.push('Expand content to at least 1000 words for competitive keywords');
      validation.score = 20;
    } else if (wordCount < 600) {
      validation.issues.push('Content length below competitive threshold (less than 600 words)');
      validation.recommendations.push('Consider expanding content for better search visibility');
      validation.score = 50;
    } else if (wordCount < 1000) {
      validation.issues.push('Content length below optimal range (less than 1000 words)');
      validation.recommendations.push('Expand content to 1000+ words for competitive advantage');
      validation.score = 70;
    } else {
      validation.score = 100;
    }

    return validation;
  }

  /**
   * Validate image optimization
   * @param {Array} images - Array of images
   * @returns {Object} Image validation result
   */
  validateImageOptimization(images) {
    const validation = {
      score: 0,
      imageCount: images ? images.length : 0,
      issues: [],
      recommendations: []
    };

    if (!images || images.length === 0) {
      validation.issues.push('No images found');
      validation.recommendations.push('Add relevant images with descriptive alt text');
      validation.score = 50; // Not critical for all pages
      return validation;
    }

    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;

    images.forEach(image => {
      if (image.alt && image.alt.trim().length > 0) {
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
      }
    });

    if (imagesWithoutAlt === 0) {
      validation.score = 100;
    } else if (imagesWithAlt > imagesWithoutAlt) {
      validation.score = 70;
      validation.issues.push(`${imagesWithoutAlt} images missing alt text`);
      validation.recommendations.push('Add descriptive alt text to all images');
    } else {
      validation.score = 30;
      validation.issues.push(`${imagesWithoutAlt} images missing alt text`);
      validation.recommendations.push('Add descriptive alt text to all images for accessibility and SEO');
    }

    return validation;
  }

  /**
   * Validate internal linking strategy
   * @param {Object} links - Links analysis
   * @returns {Object} Internal linking validation result
   */
  validateInternalLinking(links) {
    const validation = {
      score: 0,
      internalCount: links?.internal || 0,
      externalCount: links?.external || 0,
      issues: [],
      recommendations: []
    };

    const totalLinks = validation.internalCount + validation.externalCount;

    if (totalLinks === 0) {
      validation.issues.push('No links found on page');
      validation.recommendations.push('Add relevant internal and external links');
      validation.score = 30;
      return validation;
    }

    if (validation.internalCount === 0) {
      validation.issues.push('No internal links found');
      validation.recommendations.push('Add 2-5 contextual internal links to related pages');
      validation.score = 40;
    } else if (validation.internalCount < 2) {
      validation.issues.push('Too few internal links');
      validation.recommendations.push('Add more internal links to improve site navigation');
      validation.score = 60;
    } else if (validation.internalCount > 10) {
      validation.issues.push('Too many internal links may dilute link equity');
      validation.recommendations.push('Focus on 3-8 high-quality internal links');
      validation.score = 80;
    } else {
      validation.score = 100;
    }

    return validation;
  }

  /**
   * Validate technical SEO elements
   * @param {Object} technical - Technical SEO data
   * @returns {Object} Technical SEO validation result
   */
  validateTechnicalSEO(technical) {
    const validation = {
      score: 0,
      issues: [],
      recommendations: []
    };

    let score = 0;
    let checks = 0;

    // Meta viewport check
    if (technical?.viewport) {
      score += 25;
    } else {
      validation.issues.push('Missing or incorrect viewport meta tag');
      validation.recommendations.push('Add viewport meta tag for mobile optimization');
    }
    checks++;

    // Canonical URL check
    if (technical?.canonical) {
      score += 25;
    } else {
      validation.issues.push('Missing canonical URL');
      validation.recommendations.push('Add canonical URL to prevent duplicate content issues');
    }
    checks++;

    // Language attribute check
    if (technical?.lang) {
      score += 25;
    } else {
      validation.issues.push('Missing language attribute');
      validation.recommendations.push('Add language attribute to html tag');
    }
    checks++;

    // Robots meta check
    if (technical?.robots && !technical.robots.includes('noindex')) {
      score += 25;
    } else if (technical?.robots?.includes('noindex')) {
      validation.issues.push('Page is set to noindex');
      validation.recommendations.push('Remove noindex if page should be indexed');
    } else {
      validation.issues.push('Missing or unclear robots directive');
      validation.recommendations.push('Add appropriate robots meta tag');
    }
    checks++;

    validation.score = Math.round(score / checks * 100);

    return validation;
  }

  /**
   * Generate SEO optimization priority matrix
   * @param {Object} validation - SEO validation results
   * @returns {Array} Priority matrix
   */
  generateSEOPriorityMatrix(validation) {
    const priorities = [];

    // Critical issues (score < 50)
    Object.keys(validation).forEach(area => {
      const item = validation[area];
      if (typeof item === 'object' && item.score !== undefined && item.score < 50) {
        priorities.push({
          area: area,
          priority: 'critical',
          score: item.score,
          impact: 'high',
          effort: this.getImplementationEffort(area),
          issues: item.issues || [],
          recommendations: item.recommendations || []
        });
      }
    });

    // High priority issues (score 50-70)
    Object.keys(validation).forEach(area => {
      const item = validation[area];
      if (typeof item === 'object' && item.score !== undefined && item.score >= 50 && item.score < 70) {
        priorities.push({
          area: area,
          priority: 'high',
          score: item.score,
          impact: 'medium',
          effort: this.getImplementationEffort(area),
          issues: item.issues || [],
          recommendations: item.recommendations || []
        });
      }
    });

    // Sort by priority and impact
    return priorities.sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get implementation effort for SEO area
   * @param {string} area - SEO area
   * @returns {string} Effort level
   */
  getImplementationEffort(area) {
    const effortMap = {
      'titleTag': 'low',
      'metaDescription': 'low',
      'headingStructure': 'medium',
      'contentLength': 'high',
      'imageOptimization': 'medium',
      'internalLinking': 'medium',
      'technicalSEO': 'medium'
    };

    return effortMap[area] || 'medium';
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 50,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: 'Hello, please respond with "Connection successful"'
          }
        ]
      });

      const response = message.content[0].text;
      return response.includes('Connection successful') || response.length > 0;

    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

module.exports = AIAnalyzer;