/**
 * Prompt Manager Service
 * Handles management of AI analysis prompts and templates
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Prompt Manager Class
 * Provides comprehensive prompt management capabilities
 */
class PromptManager {
  constructor() {
    this.defaultPrompts = [
      {
        name: 'seo-technical-implementation',
        description: 'Advanced technical SEO implementation with exact code solutions',
        content: `You are a senior technical SEO specialist. Analyze the webpage data and provide EXACT, COPY-PASTE ready technical SEO solutions.

**CRITICAL TECHNICAL SEO ANALYSIS AREAS:**

1. **META TAG OPTIMIZATION** (Highest Priority):
   - Analyze current title tag: character count, keyword placement, click-through optimization
   - Provide EXACT replacement title tag HTML with optimal keywords from page content
   - Analyze current meta description: length, compelling copy, call-to-action inclusion
   - Write EXACT meta description HTML with optimal length and persuasive copy
   - Check canonical URL implementation and provide exact canonical tag if needed

2. **HTML STRUCTURE & SEMANTIC SEO**:
   - Audit heading hierarchy (H1, H2, H3, etc.) for SEO and accessibility
   - Provide EXACT heading structure corrections with keyword optimization
   - Identify missing HTML5 semantic elements (article, section, aside, nav)
   - Give COMPLETE semantic HTML code replacements
   - Analyze and provide exact alt text for all images found

3. **STRUCTURED DATA IMPLEMENTATION**:
   - Identify missing schema markup opportunities (Organization, WebSite, Article, etc.)
   - Provide COMPLETE JSON-LD schema markup code ready to implement
   - Include specific schema types based on content analysis
   - Validate and provide exact implementation instructions

4. **CORE WEB VITALS OPTIMIZATION**:
   - Analyze performance data for LCP, FID, CLS issues
   - Provide EXACT code for image optimization (lazy loading, modern formats)
   - Give specific CSS for layout shift prevention
   - Include exact preload/prefetch tags for critical resources

5. **MOBILE-FIRST TECHNICAL FIXES**:
   - Provide exact viewport meta tag if missing or incorrect
   - Give specific responsive CSS fixes if layout issues detected
   - Include touch-friendly button size corrections
   - Provide exact AMP implementation code if beneficial

6. **CRAWLING & INDEXING OPTIMIZATION**:
   - Analyze and provide exact robots.txt improvements
   - Give specific sitemap recommendations and generation code
   - Provide exact internal linking improvements with anchor text
   - Include exact robots meta tag implementations

**OUTPUT FORMAT** for each technical fix:
\`\`\`
ISSUE: [Specific technical SEO problem found]
IMPACT: [Exact SEO/ranking impact this issue causes]
PRIORITY: [Critical/High/Medium/Low]
DIFFICULTY: [Beginner/Intermediate/Advanced]

CURRENT STATE: [What's currently implemented or missing]
OPTIMAL SOLUTION: [Exactly what should be implemented]

EXACT CODE TO IMPLEMENT:
[Complete, copy-paste ready HTML/CSS/JS code]

IMPLEMENTATION STEPS:
1. [Exact step-by-step instructions]
2. [Where to place the code]
3. [How to test it works]

VALIDATION: [How to verify the fix worked]
TOOLS: [Specific tools to use for testing]
TIMELINE: [When to expect SEO results]
EXPECTED IMPROVEMENT: [Specific ranking/traffic improvement]
\`\`\`

**REQUIREMENTS:**
- Use ACTUAL webpage content in all code examples
- Provide EXACT character counts for meta tags
- Include SPECIFIC implementation locations
- Give MEASURABLE improvement expectations
- Provide VALIDATION methods for each fix`,
        category: 'technical'
      },
      {
        name: 'content-optimization-plan',
        description: 'Strategic content optimization with competitor analysis and keyword targeting',
        content: `You are a senior content strategist and SEO expert. Analyze the webpage content and provide STRATEGIC content optimization plan to dominate search results.

**COMPREHENSIVE CONTENT AUDIT & STRATEGY:**

1. **CONTENT GAP ANALYSIS**:
   - Analyze current word count vs top-ranking competitors for target keywords
   - Identify missing topics/sections that top-ranking pages include
   - Find semantic keyword opportunities based on content analysis
   - Determine optimal content length for competitive keywords

2. **KEYWORD OPTIMIZATION STRATEGY**:
   - Audit current keyword usage and density in existing content
   - Identify primary, secondary, and long-tail keyword opportunities
   - Provide EXACT keyword placement strategy (title, headings, body, meta)
   - Suggest internal linking opportunities with specific anchor text

3. **CONTENT STRUCTURE & USER EXPERIENCE**:
   - Analyze current heading hierarchy for SEO and readability
   - Provide EXACT heading structure with keyword optimization
   - Suggest specific content sections to add for better user engagement
   - Include table of contents, FAQ sections, or other structural improvements

4. **E-A-T (EXPERTISE, AUTHORITY, TRUST) ENHANCEMENT**:
   - Identify opportunities to demonstrate expertise and authority
   - Suggest specific credibility signals to add (citations, author bios, credentials)
   - Provide exact trust-building content elements
   - Include specific social proof and testimonial integration

5. **CONTENT EXPANSION OPPORTUNITIES**:
   - Identify high-value content sections to expand
   - Suggest specific multimedia content to add (images, videos, infographics)
   - Provide exact FAQ content based on search intent analysis
   - Include specific call-to-action optimizations

**OUTPUT FORMAT** for each content optimization:
\`\`\`
CONTENT AREA: [Specific section of content to optimize]
CURRENT STATE: [Current word count, keywords, structure]
COMPETITIVE GAP: [What top-ranking competitors have that this page lacks]

OPTIMIZATION STRATEGY:
- Target Word Count: [Specific count with reasoning]
- Primary Keywords: [3-5 main keywords to target]
- Secondary Keywords: [5-10 supporting keywords]
- Long-tail Opportunities: [Specific long-tail phrases to include]

EXACT CONTENT TO ADD:
[Word-for-word content sections to add or modify]

HEADING STRUCTURE:
H1: [Exact heading with primary keyword]
H2: [Exact subheadings with secondary keywords]
H3: [Supporting headings for content hierarchy]

INTERNAL LINKING PLAN:
- [Specific internal links to add with exact anchor text]
- [Target pages and contextual linking opportunities]

MULTIMEDIA CONTENT:
- Images: [Specific images to add with exact alt text]
- Videos: [Video content opportunities]
- Other media: [Infographics, charts, etc.]

IMPLEMENTATION PRIORITY: [Critical/High/Medium/Low]
CONTENT CREATION TIME: [Hours/days needed]
EXPECTED RESULTS: [Ranking improvement timeline and metrics]
COMPETITIVE ADVANTAGE: [How this beats competitors]
\`\`\`

**REQUIREMENTS:**
- Use ACTUAL content from the webpage in analysis
- Reference SPECIFIC competitors and their content advantages
- Provide EXACT word count targets and keyword densities
- Include MEASURABLE outcomes and timelines
- Give SPECIFIC implementation steps for content teams`,
        category: 'content'
      },
      {
        name: 'competitive-gap-actions',
        description: 'Advanced competitive analysis with actionable strategies to dominate search rankings',
        content: `You are a competitive SEO intelligence expert. Analyze the webpage and provide STRATEGIC competitive analysis with exact implementation plans to outrank competitors.

**COMPETITIVE INTELLIGENCE ANALYSIS:**

1. **SERP COMPETITOR GAPS ANALYSIS**:
   - Identify content gaps compared to top 3 ranking competitors
   - Analyze competitor keyword strategies and missed opportunities
   - Find unique content angles competitors haven't explored
   - Identify technical advantages competitors lack

2. **CONTENT COMPETITIVE ADVANTAGE**:
   - Analyze competitor content depth and quality
   - Identify topics competitors cover that this page misses
   - Find opportunities for superior content creation
   - Suggest unique content formats competitors don't use

3. **TECHNICAL COMPETITIVE EDGES**:
   - Analyze competitor site speed and Core Web Vitals
   - Identify technical SEO advantages to exploit
   - Find structured data opportunities competitors miss
   - Discover mobile optimization gaps

4. **USER EXPERIENCE DIFFERENTIATION**:
   - Analyze competitor user experience and navigation
   - Identify conversion optimization opportunities
   - Find accessibility advantages to implement
   - Discover visual design improvements

5. **LINK BUILDING & AUTHORITY OPPORTUNITIES**:
   - Identify competitor backlink strategies
   - Find link-earning content opportunities
   - Discover local citation opportunities
   - Identify partnership opportunities competitors miss

**OUTPUT FORMAT** for each competitive strategy:
\`\`\`
COMPETITIVE OPPORTUNITY: [Specific gap or advantage to exploit]
COMPETITOR ANALYSIS: [What top competitors are doing/missing]
TRAFFIC POTENTIAL: [Estimated monthly visitors from this opportunity]

STRATEGIC APPROACH:
- Primary Objective: [Main goal of this competitive strategy]
- Competitive Advantage: [Specific advantage this creates]
- Market Positioning: [How this differentiates from competitors]

EXACT IMPLEMENTATION PLAN:
Phase 1 (Weeks 1-2): [Immediate actions to take]
Phase 2 (Weeks 3-6): [Medium-term implementation steps]
Phase 3 (Month 2-3): [Long-term competitive advantage building]

REQUIRED RESOURCES:
- Content Creation: [Hours/budget needed]
- Technical Development: [Developer hours required]
- Tools/Software: [Specific tools needed]
- Budget: [Estimated cost for implementation]

SUCCESS METRICS:
- Ranking Improvement: [Expected SERP position gains]
- Traffic Increase: [Projected organic traffic growth]
- Competitive Monitoring: [KPIs to track vs competitors]

COMPETITIVE VALIDATION:
- Monitoring Tools: [Specific tools to track competitor changes]
- Success Indicators: [How to measure competitive advantage]
- Timeline to Results: [When to expect competitive gains]

RISK MITIGATION:
- Competitor Response: [How competitors might react]
- Market Changes: [External factors to consider]
- Backup Strategies: [Alternative approaches if main strategy fails]
\`\`\`

**REQUIREMENTS:**
- Use ACTUAL webpage data and realistic competitor analysis
- Provide SPECIFIC traffic and ranking projections
- Include EXACT resource requirements and budgets
- Give MEASURABLE competitive advantage timelines
- Focus on SUSTAINABLE long-term competitive advantages`,
        category: 'competitive'
      },
      {
        name: 'ux-improvement-actions',
        description: 'Advanced UX optimization with conversion and accessibility focus',
        content: `You are a senior UX/UI designer with expertise in conversion optimization and accessibility. Analyze the webpage and provide STRATEGIC user experience improvements that boost both SEO and conversions.

**COMPREHENSIVE UX AUDIT & OPTIMIZATION:**

1. **CONVERSION-FOCUSED UX IMPROVEMENTS**:
   - Analyze current conversion funnel and user journey
   - Identify friction points that reduce conversions
   - Optimize call-to-action placement, design, and copy
   - Improve form design and checkout processes

2. **ACCESSIBILITY & INCLUSIVE DESIGN**:
   - Audit for WCAG 2.1 AA compliance issues
   - Improve color contrast and visual hierarchy
   - Enhance keyboard navigation and screen reader compatibility
   - Implement proper semantic HTML structure

3. **MOBILE-FIRST UX OPTIMIZATION**:
   - Analyze mobile user experience and touch interactions
   - Optimize touch target sizes and spacing
   - Improve mobile navigation and menu design
   - Enhance mobile content consumption experience

4. **PAGE SPEED & PERCEIVED PERFORMANCE**:
   - Optimize loading sequences and perceived speed
   - Implement progressive loading strategies
   - Reduce layout shifts and improve stability
   - Optimize above-the-fold content delivery

5. **NAVIGATION & INFORMATION ARCHITECTURE**:
   - Improve site navigation and menu structure
   - Enhance internal linking and page connections
   - Implement breadcrumbs and location indicators
   - Optimize search functionality and filters

**OUTPUT FORMAT** for each UX improvement:
\`\`\`
UX AREA: [Specific area of user experience to improve]
CURRENT ISSUE: [Specific UX problem identified]
USER IMPACT: [How this affects user behavior and conversions]

OPTIMIZATION STRATEGY:
- Primary Goal: [Main UX improvement objective]
- User Benefit: [How this improves user experience]
- Business Impact: [Expected conversion/engagement improvement]

EXACT IMPLEMENTATION:
HTML Changes: [Complete HTML code modifications]
CSS Modifications: [Specific CSS styles to implement]
JavaScript Enhancements: [Interactive improvements needed]

ACCESSIBILITY IMPROVEMENTS:
- ARIA Labels: [Specific accessibility attributes to add]
- Color Contrast: [Exact color codes for better contrast]
- Keyboard Navigation: [Tab order and focus improvements]

MOBILE OPTIMIZATIONS:
- Touch Targets: [Minimum 44px touch target implementations]
- Responsive Breakpoints: [Specific media query adjustments]
- Mobile Navigation: [Mobile-specific navigation improvements]

CONVERSION OPTIMIZATION:
- CTA Improvements: [Exact button text, colors, and placement]
- Form Optimizations: [Specific form field and validation improvements]
- Trust Signals: [Social proof and credibility elements to add]

TESTING & VALIDATION:
- A/B Testing Plan: [Specific elements to test]
- Success Metrics: [Conversion rate, engagement metrics to track]
- User Testing: [Specific user scenarios to validate]

IMPLEMENTATION DETAILS:
- Development Time: [Hours needed for frontend development]
- Design Resources: [Design assets or mockups needed]
- Testing Requirements: [Cross-browser and device testing needed]
- SEO Benefits: [How UX improvements help SEO rankings]

EXPECTED RESULTS:
- Conversion Improvement: [Projected increase in conversion rates]
- User Engagement: [Expected improvements in bounce rate, time on page]
- Accessibility Score: [WCAG compliance level achievement]
- Timeline: [When to expect user behavior improvements]
\`\`\`

**REQUIREMENTS:**
- Focus on MEASURABLE conversion improvements
- Ensure all improvements are ACCESSIBILITY compliant
- Provide EXACT code implementations
- Include MOBILE-FIRST design considerations
- Give SPECIFIC testing and validation methods`,
        category: 'ux'
      },
      {
        name: 'local-seo-implementation',
        description: 'Comprehensive local SEO strategy with Google My Business and citation optimization',
        content: `You are a local SEO specialist with expertise in Google My Business optimization and local search rankings. Analyze the webpage and provide STRATEGIC local SEO implementation plan.

**COMPREHENSIVE LOCAL SEO ANALYSIS:**

1. **LOCAL BUSINESS ENTITY OPTIMIZATION**:
   - Analyze current NAP (Name, Address, Phone) consistency
   - Implement proper business entity markup and schema
   - Optimize for local search intent and geo-targeting
   - Establish clear service area definitions

2. **GOOGLE MY BUSINESS OPTIMIZATION**:
   - Optimize business profile completeness and accuracy
   - Implement review generation and management strategies
   - Create location-specific content and posting plans
   - Optimize for Google's local ranking factors

3. **LOCATION-BASED CONTENT STRATEGY**:
   - Develop city and region-specific content plans
   - Implement local keyword optimization strategies
   - Create location landing pages and service area content
   - Optimize for "near me" and local search queries

4. **LOCAL CITATION & DIRECTORY OPTIMIZATION**:
   - Audit current citation profile and consistency
   - Implement citation building strategy for key directories
   - Optimize for industry-specific local directories
   - Monitor and manage citation accuracy

5. **LOCAL LINK BUILDING & COMMUNITY ENGAGEMENT**:
   - Develop local partnership and sponsorship opportunities
   - Create community-focused content for link earning
   - Implement local event and organization outreach
   - Build relationships with local media and bloggers

**OUTPUT FORMAT** for each local SEO strategy:
\`\`\`
LOCAL SEO AREA: [Specific local search optimization area]
CURRENT LOCAL VISIBILITY: [Current local search performance analysis]
LOCAL OPPORTUNITY: [Specific local search opportunity to exploit]

LOCAL OPTIMIZATION STRATEGY:
- Primary Local Keywords: [Specific geo-targeted keywords]
- Service Area Focus: [Cities, regions, or areas to target]
- Local Competition: [Key local competitors to outrank]

EXACT IMPLEMENTATION PLAN:

NAP OPTIMIZATION:
- Business Name: [Exact business name formatting]
- Address Format: [Complete address with proper formatting]
- Phone Number: [Primary and secondary phone numbers]
- Hours of Operation: [Detailed hours with holiday schedules]

SCHEMA MARKUP CODE:
[Complete LocalBusiness JSON-LD schema code to implement]

GOOGLE MY BUSINESS OPTIMIZATION:
- Profile Completeness: [Specific GMB sections to complete]
- Category Selection: [Primary and secondary GMB categories]
- Business Description: [Exact GMB business description copy]
- Photo Strategy: [Specific photos to add with naming conventions]
- Post Schedule: [Weekly GMB posting calendar and content ideas]

LOCATION CONTENT STRATEGY:
- City Pages: [Specific location pages to create]
- Local Keywords: [Exact local keyword implementation plan]
- Content Calendar: [Local content creation schedule]

CITATION BUILDING PLAN:
- Priority Directories: [Top 20 directories for submission]
- Industry Directories: [Specific industry-relevant directories]
- Local Directories: [City and region-specific directories]
- Citation Format: [Exact NAP format for consistency]

LOCAL LINK BUILDING OPPORTUNITIES:
- Local Organizations: [Specific groups to partner with]
- Community Events: [Events to sponsor or participate in]
- Local Media Outreach: [Media contacts and story angles]
- Chamber of Commerce: [Local business organization opportunities]

IMPLEMENTATION TIMELINE:
Week 1-2: [Immediate local SEO fixes and optimizations]
Week 3-6: [Citation building and GMB optimization]
Month 2-3: [Local content creation and link building]

SUCCESS METRICS:
- Local Pack Rankings: [Target positions for key local searches]
- Google My Business Insights: [GMB metrics to track]
- Local Organic Traffic: [Projected local search traffic increase]
- Citation Accuracy: [Citation consistency score targets]

COMPETITIVE ANALYSIS:
- Local Competitors: [Top 3 local competitors analysis]
- Competitive Gaps: [Specific advantages to exploit]
- Market Positioning: [How to differentiate in local market]

BUDGET & RESOURCES:
- Citation Building: [Cost for directory submissions]
- Content Creation: [Hours for local content development]
- Tool Requirements: [Local SEO tools needed]
- Ongoing Management: [Monthly maintenance requirements]
\`\`\`

**REQUIREMENTS:**
- Focus on MEASURABLE local search improvements
- Provide EXACT NAP formatting and consistency
- Include COMPLETE schema markup implementations
- Give SPECIFIC Google My Business optimization steps
- Provide ACTIONABLE local link building strategies`,
        category: 'local'
      }
    ];
  }

  /**
   * Get all active prompts
   * @param {Object} filters - Optional filters (category, active status)
   * @returns {Promise<Array>} Array of prompts
   */
  async getAllPrompts(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.category) {
        whereClause += ' AND category = $' + (params.length + 1);
        params.push(filters.category);
      }
      
      if (filters.active !== undefined) {
        whereClause += ' AND is_active = $' + (params.length + 1);
        params.push(filters.active);
      }
      
      const sqlQuery = `
        SELECT id, name, description, content, category, is_active, 
               created_at, updated_at, created_by
        FROM prompts 
        ${whereClause}
        ORDER BY category, name
      `;
      
      const result = await query(sqlQuery, params);
      return result.rows;
      
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  }

  /**
   * Get prompt by ID
   * @param {string} promptId - Prompt UUID
   * @returns {Promise<Object>} Prompt object
   */
  async getPromptById(promptId) {
    try {
      const result = await query(
        'SELECT * FROM prompts WHERE id = $1',
        [promptId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Prompt with ID ${promptId} not found`);
      }
      
      return result.rows[0];
      
    } catch (error) {
      console.error('Error fetching prompt by ID:', error);
      throw error;
    }
  }

  /**
   * Get prompt by name
   * @param {string} name - Prompt name
   * @returns {Promise<Object>} Prompt object
   */
  async getPromptByName(name) {
    try {
      const result = await query(
        'SELECT * FROM prompts WHERE name = $1',
        [name]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Prompt with name '${name}' not found`);
      }
      
      return result.rows[0];
      
    } catch (error) {
      console.error('Error fetching prompt by name:', error);
      throw error;
    }
  }

  /**
   * Create a new prompt
   * @param {Object} promptData - Prompt data
   * @returns {Promise<Object>} Created prompt
   */
  async createPrompt(promptData) {
    try {
      const {
        name,
        description,
        content,
        category = 'general',
        isActive = true,
        createdBy = 'system'
      } = promptData;

      // Validate required fields
      if (!name || !content) {
        throw new Error('Name and content are required fields');
      }

      // Check if prompt name already exists
      try {
        await this.getPromptByName(name);
        throw new Error(`Prompt with name '${name}' already exists`);
      } catch (error) {
        // If prompt doesn't exist, continue with creation
        if (!error.message.includes('not found')) {
          throw error;
        }
      }

      const promptId = uuidv4();
      const result = await query(`
        INSERT INTO prompts (id, name, description, content, category, is_active, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [promptId, name, description, content, category, isActive, createdBy]);
      
      console.log(`Created new prompt: ${name}`);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  }

  /**
   * Update an existing prompt
   * @param {string} promptId - Prompt UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated prompt
   */
  async updatePrompt(promptId, updateData) {
    try {
      // Verify prompt exists
      await this.getPromptById(promptId);

      const {
        name,
        description,
        content,
        category,
        isActive
      } = updateData;

      // Check if new name conflicts with existing prompt
      if (name) {
        try {
          const existingPrompt = await this.getPromptByName(name);
          if (existingPrompt.id !== promptId) {
            throw new Error(`Prompt with name '${name}' already exists`);
          }
        } catch (error) {
          // If prompt doesn't exist, continue with update
          if (!error.message.includes('not found') && !error.message.includes('already exists')) {
            throw error;
          }
          if (error.message.includes('already exists')) {
            throw error;
          }
        }
      }

      // Build dynamic update query
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        params.push(name);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        params.push(description);
      }
      if (content !== undefined) {
        updates.push(`content = $${paramIndex++}`);
        params.push(content);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramIndex++}`);
        params.push(category);
      }
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        params.push(isActive);
      }

      if (updates.length === 0) {
        throw new Error('No update data provided');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(promptId);

      const result = await query(`
        UPDATE prompts 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

      console.log(`Updated prompt: ${promptId}`);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  /**
   * Delete a prompt
   * @param {string} promptId - Prompt UUID
   * @returns {Promise<boolean>} Success status
   */
  async deletePrompt(promptId) {
    try {
      // Verify prompt exists
      await this.getPromptById(promptId);

      const result = await query(
        'DELETE FROM prompts WHERE id = $1',
        [promptId]
      );
      
      const deleted = result.rowCount > 0;
      
      if (deleted) {
        console.log(`Deleted prompt: ${promptId}`);
      }
      
      return deleted;
      
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }

  /**
   * Get prompts by category
   * @param {string} category - Prompt category
   * @returns {Promise<Array>} Array of prompts
   */
  async getPromptsByCategory(category) {
    try {
      const result = await query(
        'SELECT * FROM prompts WHERE category = $1 AND is_active = true ORDER BY name',
        [category]
      );
      
      return result.rows;
      
    } catch (error) {
      console.error('Error fetching prompts by category:', error);
      throw error;
    }
  }

  /**
   * Get available prompt categories
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    try {
      const result = await query(`
        SELECT DISTINCT category, COUNT(*) as prompt_count
        FROM prompts 
        WHERE is_active = true
        GROUP BY category 
        ORDER BY category
      `);
      
      return result.rows;
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Initialize default prompts
   * Creates default prompts if they don't exist
   * @returns {Promise<Array>} Created prompts
   */
  async initializeDefaultPrompts() {
    try {
      const createdPrompts = [];
      
      for (const prompt of this.defaultPrompts) {
        try {
          // Check if prompt already exists
          await this.getPromptByName(prompt.name);
          console.log(`Prompt '${prompt.name}' already exists, skipping`);
        } catch (error) {
          if (error.message.includes('not found')) {
            // Create the prompt
            const createdPrompt = await this.createPrompt(prompt);
            createdPrompts.push(createdPrompt);
            console.log(`Created default prompt: ${prompt.name}`);
          } else {
            throw error;
          }
        }
      }
      
      return createdPrompts;
      
    } catch (error) {
      console.error('Error initializing default prompts:', error);
      throw error;
    }
  }

  /**
   * Search prompts by text
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching prompts
   */
  async searchPrompts(searchTerm, options = {}) {
    try {
      const { category, limit = 50 } = options;
      
      let whereClause = `WHERE (
        name ILIKE $1 OR 
        description ILIKE $1 OR 
        content ILIKE $1
      ) AND is_active = true`;
      
      const params = [`%${searchTerm}%`];
      
      if (category) {
        whereClause += ' AND category = $2';
        params.push(category);
      }
      
      const result = await query(`
        SELECT id, name, description, category, created_at,
               ts_rank(to_tsvector('english', name || ' ' || description || ' ' || content), 
                       plainto_tsquery('english', $1)) as relevance
        FROM prompts 
        ${whereClause}
        ORDER BY relevance DESC, name
        LIMIT $${params.length + 1}
      `, [...params, limit]);
      
      return result.rows;
      
    } catch (error) {
      console.error('Error searching prompts:', error);
      throw error;
    }
  }

  /**
   * Get prompt usage statistics
   * @param {string} promptId - Prompt UUID (optional)
   * @returns {Promise<Object>} Usage statistics
   */
  async getPromptUsageStats(promptId = null) {
    try {
      let whereClause = '';
      const params = [];
      
      if (promptId) {
        whereClause = 'WHERE ap.prompt_id = $1';
        params.push(promptId);
      }
      
      const result = await query(`
        SELECT 
          p.id,
          p.name,
          p.category,
          COUNT(ap.analysis_id) as usage_count,
          MAX(ap.created_at) as last_used,
          MIN(ap.created_at) as first_used
        FROM prompts p
        LEFT JOIN analysis_prompts ap ON p.id = ap.prompt_id
        ${whereClause}
        GROUP BY p.id, p.name, p.category
        ORDER BY usage_count DESC
      `, params);
      
      if (promptId) {
        return result.rows[0] || null;
      }
      
      return result.rows;
      
    } catch (error) {
      console.error('Error fetching prompt usage stats:', error);
      throw error;
    }
  }
}

module.exports = PromptManager;