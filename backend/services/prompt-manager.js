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
        description: 'Concrete technical SEO implementation guide',
        content: `Provide SPECIFIC, IMPLEMENTABLE technical SEO actions based on the webpage data.

For each technical area, provide EXACT implementation steps:

1. **Meta Tag Optimization**:
   - Provide exact HTML code for optimal title tags (30-60 chars)
   - Write specific meta description content (120-160 chars)
   - Include exact canonical URL implementation

2. **HTML Structure Fixes**:
   - Provide exact heading hierarchy corrections (H1, H2, H3 structure)
   - Include specific HTML5 semantic element implementations
   - Give exact code for missing structured data/schema markup

3. **Performance Optimizations**:
   - List specific files to compress/optimize
   - Provide exact code for implementing lazy loading
   - Include specific caching headers to implement

4. **Mobile & Technical Implementation**:
   - Provide exact viewport meta tag if missing
   - Include specific robots.txt directives needed
   - Give exact SSL/HTTPS configuration steps

Format each recommendation as:
- TASK: [Specific action]
- CODE: [Exact HTML/CSS/config to implement]
- LOCATION: [Where to make the change]
- EXPECTED RESULT: [Measurable improvement]
- TIMEFRAME: [immediate/1-day/1-week]`,
        category: 'technical'
      },
      {
        name: 'content-optimization-plan',
        description: 'Specific content optimization action plan',
        content: `Provide CONCRETE content optimization actions with exact implementation steps.

For each content area, provide SPECIFIC changes to make:

1. **Content Length & Depth**:
   - Specify exact word count targets (e.g., "Increase from 400 to 1200 words")
   - List specific topics/sections to add
   - Provide exact paragraph structure improvements

2. **Keyword Optimization**:
   - Suggest specific keywords to target (with exact placement locations)
   - Provide exact title tag content with target keywords
   - Include specific H2/H3 headings with keyword optimization

3. **Content Structure Improvements**:
   - List exact subheadings to add/modify
   - Provide specific bullet points or list formats to implement
   - Include exact internal linking opportunities with anchor text

4. **Content Enhancement Actions**:
   - Specify exact images/media to add (with alt text)
   - Provide specific calls-to-action content
   - Include exact FAQ sections or content blocks to add

5. **E-A-T Improvements**:
   - List specific author bio/credentials to add
   - Provide exact citation/reference content
   - Include specific social proof elements to implement

Format each action as:
- ACTION: [Specific content change]
- EXACT CONTENT: [Word-for-word text to add/modify]
- PLACEMENT: [Exactly where in the content]
- TARGET METRIC: [Word count, keyword density, etc.]
- TIMEFRAME: [Content manager can implement in X hours]`,
        category: 'content'
      },
      {
        name: 'competitive-gap-actions',
        description: 'Specific actions to outrank competitors',
        content: `Provide ACTIONABLE strategies to improve competitive positioning with specific implementation steps.

Based on the webpage data, identify and provide CONCRETE actions for:

1. **Content Gap Opportunities**:
   - List specific topics/keywords competitors likely rank for that this page misses
   - Provide exact content sections to add (with word count targets)
   - Include specific competitor features to replicate or improve upon

2. **Technical Competitive Advantages**:
   - Identify specific technical improvements that will outperform competitors
   - Provide exact performance optimizations to implement
   - Include specific structured data implementations competitors may lack

3. **User Experience Improvements**:
   - List specific UX enhancements to implement
   - Provide exact navigation/layout improvements
   - Include specific conversion optimization elements to add

4. **Content Differentiation Actions**:
   - Suggest specific unique content angles to pursue
   - Provide exact formatting/presentation improvements
   - Include specific multimedia elements to add

5. **Link Building Opportunities**:
   - Identify specific pages/content to create for link attraction
   - Provide exact outreach strategies with templates
   - Include specific internal linking improvements

Format each recommendation as:
- COMPETITIVE ACTION: [Specific strategy to outrank competitors]
- IMPLEMENTATION: [Step-by-step execution plan]
- RESOURCES NEEDED: [Specific tools, content, or budget required]
- SUCCESS METRICS: [How to measure competitive improvement]
- TIMELINE: [Realistic implementation schedule]`,
        category: 'competitive'
      },
      {
        name: 'ux-improvement-actions',
        description: 'Specific UX improvements to implement',
        content: `Provide CONCRETE user experience improvements with exact implementation details.

For each UX area, specify EXACT changes to implement:

1. **Navigation Improvements**:
   - Provide exact menu structure/navigation elements to add/modify
   - Include specific breadcrumb implementations
   - List exact internal linking improvements with anchor text

2. **Accessibility Fixes**:
   - Provide exact HTML attributes to add (alt tags, ARIA labels, etc.)
   - Include specific color contrast adjustments with hex codes
   - List exact keyboard navigation improvements

3. **Visual Hierarchy Enhancements**:
   - Specify exact heading structure changes (H1, H2, H3 modifications)
   - Provide specific font size/weight adjustments
   - Include exact spacing and layout improvements

4. **Mobile UX Optimizations**:
   - List specific responsive design fixes to implement
   - Provide exact touch target size improvements
   - Include specific mobile navigation enhancements

5. **Conversion Optimization Actions**:
   - Provide exact call-to-action button text and placement
   - Include specific form field optimizations
   - List exact trust signals/social proof to add

6. **Page Speed UX Improvements**:
   - Specify exact loading optimization techniques
   - Provide specific image optimization steps
   - Include exact caching implementations

Format each improvement as:
- UX ISSUE: [Specific user experience problem]
- SOLUTION: [Exact implementation to fix it]
- CODE/CONTENT: [Specific HTML/CSS/text to implement]
- USER IMPACT: [How this improves user experience]
- IMPLEMENTATION TIME: [Developer hours needed]`,
        category: 'ux'
      },
      {
        name: 'local-seo-implementation',
        description: 'Specific local SEO actions to implement',
        content: `Provide CONCRETE local SEO optimization actions with exact implementation steps.

For each local SEO area, provide SPECIFIC implementations:

1. **NAP (Name, Address, Phone) Optimization**:
   - Provide exact business information formatting to use consistently
   - Include specific HTML markup for contact information
   - List exact schema.org LocalBusiness code to implement

2. **Location-Based Content Actions**:
   - Suggest specific location keywords to add (with exact placement)
   - Provide exact local content sections to create
   - Include specific city/region mentions to incorporate

3. **Local Schema Markup Implementation**:
   - Provide complete LocalBusiness schema code to add
   - Include specific service area markup if applicable
   - List exact review/rating schema implementations

4. **Google My Business Optimization**:
   - List specific GMB profile sections to optimize
   - Provide exact business description content
   - Include specific post categories and content ideas

5. **Local Citation Building**:
   - Identify specific local directories to submit to
   - Provide exact NAP format for consistency
   - List specific local business categories to target

6. **Local Link Building Actions**:
   - Suggest specific local organizations/events to engage with
   - Provide exact outreach templates for local partnerships
   - Include specific local content ideas for link attraction

Format each action as:
- LOCAL SEO TASK: [Specific local optimization action]
- IMPLEMENTATION: [Exact code/content/steps to execute]
- LOCATION: [Where to make the changes]
- LOCAL IMPACT: [How this improves local search visibility]
- COMPLETION TIME: [Time needed to implement]`,
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