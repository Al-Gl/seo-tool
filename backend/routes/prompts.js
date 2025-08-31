/**
 * Prompts Management Routes
 * Handles CRUD operations for AI analysis prompts
 */

const express = require('express');
const Joi = require('joi');
const PromptManager = require('../services/prompt-manager');

const router = express.Router();
const promptManager = new PromptManager();

/**
 * Validation schemas
 */
const createPromptSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Name must be at least 3 characters long',
    'string.max': 'Name cannot exceed 255 characters',
    'any.required': 'Name is required'
  }),
  description: Joi.string().max(1000).optional().allow(''),
  content: Joi.string().min(10).required().messages({
    'string.min': 'Content must be at least 10 characters long',
    'any.required': 'Content is required'
  }),
  category: Joi.string().valid('technical', 'content', 'competitive', 'ux', 'local', 'general').default('general'),
  isActive: Joi.boolean().default(true)
});

const updatePromptSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  content: Joi.string().min(10).optional(),
  category: Joi.string().valid('technical', 'content', 'competitive', 'ux', 'local', 'general').optional(),
  isActive: Joi.boolean().optional()
}).min(1); // At least one field must be provided

const querySchema = Joi.object({
  category: Joi.string().valid('technical', 'content', 'competitive', 'ux', 'local', 'general').optional(),
  active: Joi.boolean().optional(),
  search: Joi.string().min(2).max(100).optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  sortBy: Joi.string().valid('name', 'category', 'created_at', 'updated_at').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

/**
 * GET /api/prompts
 * Get all prompts with optional filtering and search
 */
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString()
      });
    }

    const { category, active, search, limit, offset } = value;

    let prompts;
    
    if (search) {
      // Search prompts
      prompts = await promptManager.searchPrompts(search, { category, limit });
    } else {
      // Get filtered prompts
      const filters = {};
      if (category !== undefined) filters.category = category;
      if (active !== undefined) filters.active = active;
      
      prompts = await promptManager.getAllPrompts(filters);
      
      // Apply pagination
      prompts = prompts.slice(offset, offset + limit);
    }

    // Get categories for metadata
    const categories = await promptManager.getCategories();

    res.json({
      prompts: prompts.map(prompt => ({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        category: prompt.category,
        isActive: prompt.is_active,
        createdAt: prompt.created_at,
        updatedAt: prompt.updated_at,
        createdBy: prompt.created_by
      })),
      metadata: {
        total: prompts.length,
        categories: categories,
        filters: { category, active, search },
        pagination: { limit, offset }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch prompts',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/prompts/:id
 * Get a specific prompt by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid prompt ID',
        timestamp: new Date().toISOString()
      });
    }

    const prompt = await promptManager.getPromptById(id);
    
    // Get usage statistics
    const usageStats = await promptManager.getPromptUsageStats(id);

    res.json({
      prompt: {
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        content: prompt.content,
        category: prompt.category,
        isActive: prompt.is_active,
        createdAt: prompt.created_at,
        updatedAt: prompt.updated_at,
        createdBy: prompt.created_by
      },
      usage: usageStats || {
        usage_count: 0,
        last_used: null,
        first_used: null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Prompt Not Found',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.error('Error fetching prompt:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch prompt',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/prompts
 * Create a new prompt
 */
router.post('/', async (req, res) => {
  try {
    // Validate request
    const { error, value } = createPromptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString()
      });
    }

    const promptData = {
      ...value,
      createdBy: req.headers['x-user-id'] || 'api'
    };

    const prompt = await promptManager.createPrompt(promptData);

    res.status(201).json({
      message: 'Prompt created successfully',
      prompt: {
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        category: prompt.category,
        isActive: prompt.is_active,
        createdAt: prompt.created_at,
        createdBy: prompt.created_by
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.error('Error creating prompt:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create prompt',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PUT /api/prompts/:id
 * Update an existing prompt
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid prompt ID',
        timestamp: new Date().toISOString()
      });
    }

    // Validate request
    const { error, value } = updatePromptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        timestamp: new Date().toISOString()
      });
    }

    const updatedPrompt = await promptManager.updatePrompt(id, value);

    res.json({
      message: 'Prompt updated successfully',
      prompt: {
        id: updatedPrompt.id,
        name: updatedPrompt.name,
        description: updatedPrompt.description,
        content: updatedPrompt.content,
        category: updatedPrompt.category,
        isActive: updatedPrompt.is_active,
        createdAt: updatedPrompt.created_at,
        updatedAt: updatedPrompt.updated_at,
        createdBy: updatedPrompt.created_by
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Prompt Not Found',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.error('Error updating prompt:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update prompt',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/prompts/:id
 * Delete a prompt
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid prompt ID',
        timestamp: new Date().toISOString()
      });
    }

    const deleted = await promptManager.deletePrompt(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Prompt Not Found',
        message: `No prompt found with ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      message: 'Prompt deleted successfully',
      promptId: id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Prompt Not Found',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.error('Error deleting prompt:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete prompt',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/prompts/categories/list
 * Get all available prompt categories with counts
 */
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await promptManager.getCategories();

    res.json({
      categories: categories.map(cat => ({
        name: cat.category,
        count: parseInt(cat.prompt_count),
        description: getCategoryDescription(cat.category)
      })),
      total: categories.reduce((sum, cat) => sum + parseInt(cat.prompt_count), 0),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch categories',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/prompts/category/:category
 * Get prompts by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['technical', 'content', 'competitive', 'ux', 'local', 'general'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid Category',
        message: `Category must be one of: ${validCategories.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const prompts = await promptManager.getPromptsByCategory(category);

    res.json({
      category: category,
      description: getCategoryDescription(category),
      prompts: prompts.map(prompt => ({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        isActive: prompt.is_active,
        createdAt: prompt.created_at,
        updatedAt: prompt.updated_at
      })),
      count: prompts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching prompts by category:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch prompts by category',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/prompts/usage/stats
 * Get prompt usage statistics
 */
router.get('/usage/stats', async (req, res) => {
  try {
    const usageStats = await promptManager.getPromptUsageStats();

    const stats = {
      totalPrompts: usageStats.length,
      activePrompts: usageStats.filter(p => p.usage_count > 0).length,
      totalUsage: usageStats.reduce((sum, p) => sum + parseInt(p.usage_count), 0),
      mostUsed: usageStats.slice(0, 10).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        usageCount: parseInt(p.usage_count),
        lastUsed: p.last_used,
        firstUsed: p.first_used
      })),
      byCategory: {}
    };

    // Group by category
    usageStats.forEach(prompt => {
      if (!stats.byCategory[prompt.category]) {
        stats.byCategory[prompt.category] = {
          prompts: 0,
          totalUsage: 0
        };
      }
      stats.byCategory[prompt.category].prompts++;
      stats.byCategory[prompt.category].totalUsage += parseInt(prompt.usage_count);
    });

    res.json({
      usage: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch usage statistics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/prompts/initialize
 * Initialize default prompts (admin function)
 */
router.post('/initialize', async (req, res) => {
  try {
    // This could be protected by admin authentication
    const createdPrompts = await promptManager.initializeDefaultPrompts();

    res.json({
      message: `Initialized ${createdPrompts.length} default prompts`,
      prompts: createdPrompts.map(prompt => ({
        id: prompt.id,
        name: prompt.name,
        category: prompt.category
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error initializing default prompts:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to initialize default prompts',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/prompts/search/:term
 * Search prompts by term
 */
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { category, limit = 20 } = req.query;

    if (term.length < 2) {
      return res.status(400).json({
        error: 'Invalid Search Term',
        message: 'Search term must be at least 2 characters long',
        timestamp: new Date().toISOString()
      });
    }

    const prompts = await promptManager.searchPrompts(term, {
      category,
      limit: parseInt(limit)
    });

    res.json({
      searchTerm: term,
      category: category || 'all',
      prompts: prompts.map(prompt => ({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        category: prompt.category,
        relevance: prompt.relevance,
        createdAt: prompt.created_at
      })),
      count: prompts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error searching prompts:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search prompts',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Helper function to get category descriptions
 * @param {string} category - Category name
 * @returns {string} Category description
 */
function getCategoryDescription(category) {
  const descriptions = {
    technical: 'Technical SEO analysis focusing on crawlability, indexability, and technical performance',
    content: 'Content quality assessment including relevance, structure, and optimization',
    competitive: 'Competitive analysis and market positioning insights',
    ux: 'User experience and usability evaluation',
    local: 'Local SEO optimization for location-based businesses',
    general: 'General purpose prompts for various SEO analysis needs'
  };
  
  return descriptions[category] || 'Custom analysis prompts';
}

module.exports = router;