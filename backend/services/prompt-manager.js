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
        name: 'seo-technical-analysis',
        description: 'Comprehensive technical SEO analysis',
        content: `Analyze the following webpage data for technical SEO issues and provide detailed insights.

Focus Areas:
1. **Page Load Performance**: Evaluate loading speed, resource optimization, and Core Web Vitals
2. **Meta Tags and Structured Data**: Review title tags, meta descriptions, canonical URLs, and schema markup
3. **HTML Structure and Semantics**: Assess heading hierarchy, semantic HTML usage, and content structure
4. **Mobile Responsiveness**: Check viewport settings and mobile optimization
5. **Technical Implementation**: Review robots.txt compliance, SSL usage, and crawlability

For each area, provide:
- Current status and any issues found
- Specific recommendations for improvement
- Priority level (High/Medium/Low) for each recommendation
- Estimated impact on SEO performance

Format your response as structured analysis with clear sections and actionable recommendations.`,
        category: 'technical'
      },
      {
        name: 'content-quality-review',
        description: 'Content quality and relevance assessment',
        content: `Evaluate the content quality and SEO optimization of this webpage.

Assessment Criteria:
1. **Content Relevance and Value**: Does the content serve user intent and provide value?
2. **Keyword Usage and Density**: Analyze keyword integration and natural language usage
3. **Content Structure and Readability**: Review formatting, readability scores, and user engagement
4. **Content Depth and Authority**: Assess expertise, authoritativeness, and trustworthiness (E-A-T)
5. **Content Freshness**: Evaluate if content appears current and up-to-date

For each criterion, provide:
- Current assessment and score (1-10)
- Specific content strengths identified
- Areas for improvement with detailed suggestions
- Competitor comparison insights where applicable
- Content optimization recommendations

Conclude with a content improvement strategy prioritized by potential impact.`,
        category: 'content'
      },
      {
        name: 'competitive-analysis',
        description: 'Competitive positioning and opportunity analysis',
        content: `Perform a competitive analysis based on the webpage content and structure.

Analysis Framework:
1. **Unique Value Propositions**: Identify what differentiates this content from competitors
2. **Content Gaps and Opportunities**: Highlight missing topics or content areas
3. **Technical Advantages/Disadvantages**: Compare technical implementation quality
4. **User Experience Differentiators**: Assess UX elements that provide competitive advantage
5. **Market Positioning**: Evaluate how the content positions the brand in the market

Deliverables:
- Competitive strengths and weaknesses analysis
- Content gap identification with opportunity sizing
- Technical competitive advantages or areas for improvement
- Actionable recommendations for competitive differentiation
- Strategic insights for content and SEO strategy

Focus on providing actionable intelligence that can inform strategic decisions.`,
        category: 'competitive'
      },
      {
        name: 'user-experience-audit',
        description: 'User experience and usability assessment',
        content: `Conduct a comprehensive user experience audit of this webpage.

UX Evaluation Areas:
1. **Navigation and Information Architecture**: Assess ease of finding information
2. **Content Accessibility**: Review accessibility features and compliance
3. **Visual Hierarchy and Design**: Evaluate content presentation and visual flow
4. **Mobile User Experience**: Analyze mobile-specific usability factors
5. **Conversion Optimization**: Identify barriers to user actions and conversions

For each area, provide:
- Current UX assessment with specific observations
- Usability issues that impact SEO and user engagement
- Recommendations for improvement with implementation priority
- Impact assessment on user behavior and search rankings
- Best practice recommendations

Conclude with a prioritized UX improvement roadmap that considers both user satisfaction and SEO impact.`,
        category: 'ux'
      },
      {
        name: 'local-seo-analysis',
        description: 'Local SEO optimization assessment',
        content: `Analyze the webpage for local SEO optimization opportunities.

Local SEO Factors:
1. **Local Business Information**: Review NAP (Name, Address, Phone) consistency
2. **Local Schema Markup**: Assess LocalBusiness and other relevant schema implementation
3. **Location-Based Content**: Evaluate location-specific content and keywords
4. **Local Link Opportunities**: Identify local citation and link building opportunities
5. **Google My Business Integration**: Review GMB signals and integration

Assessment Output:
- Local SEO readiness score and current optimization level
- Missing local SEO elements with implementation guides
- Local content opportunities and keyword recommendations
- Citation and local link building strategies
- Technical local SEO improvements needed

Provide actionable recommendations specifically focused on improving local search visibility and rankings.`,
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