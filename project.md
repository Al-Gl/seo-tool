# SEO Crawler & AI Analysis Platform - Project Specification

## Project Overview

Build a web-based SEO analysis platform that crawls websites and uses AI (Gemini API initially, Claude API later) to provide intelligent SEO recommendations. The application should be cost-effective, scalable, and provide professional-grade SEO audits.

## Core Objectives

- **Primary Goal**: Create a web-based tool that crawls any URL and provides AI-powered SEO analysis
- **API Strategy**: Start with free Gemini API, easy migration to Claude API later
- **Cost Target**: $0 for testing phase, <$50/month for production
- **User Experience**: Simple URL input → comprehensive SEO analysis → actionable recommendations

## Technical Architecture

### Frontend (React/Next.js)
- **URL Input Form**: Clean interface for website analysis requests
- **Real-time Progress**: Show crawling and analysis progress
- **Results Dashboard**: Display SEO scores, issues, and recommendations
- **Report Generation**: PDF export with branding
- **Prompt Selection**: Choose between different analysis types

### Backend (Node.js/Express)
- **Web Crawler Service**: Puppeteer-based website crawling
- **AI Integration**: Modular system supporting Gemini → Claude migration
- **Prompt Management**: Configurable analysis prompts
- **Report Generation**: PDF creation with custom branding
- **API Endpoints**: RESTful API for frontend communication

### Database (PostgreSQL)
- **Analysis History**: Store past audits and results
- **User Management**: Basic user accounts (optional)
- **Prompt Templates**: Store and manage analysis prompts
- **Cache System**: Cache crawl results for performance

## Key Features

### 1. Website Crawler
```javascript
// Core crawling functionality
- Full HTML content extraction
- Performance metrics (Core Web Vitals)
- Meta tags analysis (title, description, keywords)
- Heading structure (H1-H6)
- Image analysis (alt text, optimization)
- Internal/external link analysis
- Mobile responsiveness check
- JavaScript rendering support
- Console error detection
- Schema markup extraction
```

### 2. AI Analysis System (Configurable Prompts)
```javascript
// Prompt templates
prompts = {
  'seo-audit': 'Complete SEO audit with scores and recommendations',
  'content-analysis': 'Focus on content quality and optimization', 
  'technical-seo': 'Technical performance and code analysis',
  'competitor-analysis': 'Compare against industry standards',
  'local-seo': 'Local search optimization analysis'
}
```

### 3. Results Dashboard
- **SEO Score**: Overall score (1-100) with breakdown
- **Critical Issues**: High-priority problems requiring immediate attention
- **Quick Wins**: Easy improvements with high impact
- **Technical Recommendations**: Code and performance improvements
- **Content Suggestions**: Content optimization opportunities
- **Progress Tracking**: Compare analyses over time

## API Integrations

### Gemini API Integration (Phase 1 - Free)
```javascript
// Implementation requirements
- Google AI SDK integration
- Rate limiting (15 requests/minute)
- Error handling and fallbacks
- Prompt templating system
- Response parsing and formatting
```

### Claude API Integration (Phase 2 - Production)
```javascript
// Easy migration system
- Anthropic SDK integration  
- Same prompt interface
- A/B testing capabilities
- Cost tracking and optimization
```

### Additional APIs
- **Google PageSpeed Insights**: Core Web Vitals data
- **Google Mobile-Friendly Test**: Mobile optimization check
- **W3C Markup Validator**: HTML validation

## Frontend Specifications

### Landing Page
```html
<!-- Key components needed -->
<URLInputForm>
  - URL validation
  - Analysis type selection (dropdown)
  - Custom prompt input (optional)
  - Submit button with loading states
</URLInputForm>

<ProgressTracker>
  - Crawling progress indicator
  - Analysis status updates  
  - Estimated completion time
</ProgressTracker>

<ResultsDashboard>
  - SEO score visualization
  - Issues categorization (Critical/Warning/Info)
  - Recommendations with priority
  - Action items checklist
</ResultsDashboard>
```

### Admin Panel (Phase 2)
```html
<PromptManager>
  - Create/edit analysis prompts
  - Test prompts with sample data
  - Prompt versioning and A/B testing
</PromptManager>

<AnalyticsPanel>
  - Usage statistics
  - API cost tracking
  - Popular analysis types
</AnalyticsPanel>
```

## Backend Specifications

### Core Services
```javascript
// Required service classes
class WebCrawler {
  // Puppeteer-based crawling
  async crawlSite(url) {
    // Extract all SEO-relevant data
    // Handle JavaScript-heavy sites
    // Collect performance metrics
    // Return structured data object
  }
}

class PromptManager {
  // Configurable prompt system
  getAvailablePrompts()
  generatePrompt(promptId, crawlData)
  addCustomPrompt(id, name, template)
}

class AIAnalyzer {
  // Modular AI integration
  async analyzeWithGemini(prompt)
  async analyzeWithClaude(prompt) 
  setProvider(provider)
}

class ReportGenerator {
  // PDF generation
  generatePDFReport(analysisData)
  customizeBranding(template)
}
```

### API Endpoints
```javascript
// Required REST endpoints
POST /api/analyze
  - Input: { url, promptType, customPrompt? }
  - Output: { analysisId, status, estimatedTime }

GET /api/analysis/:id  
  - Output: { status, results, crawlData, recommendations }

GET /api/prompts
  - Output: { availablePrompts[] }

POST /api/prompts (admin)
  - Input: { name, template, variables }
  
GET /api/report/:id/pdf
  - Output: PDF file download
```

## Database Schema

```sql
-- Core tables needed
CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  prompt_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  crawl_data JSONB,
  ai_analysis TEXT,
  seo_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prompt_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  template_key VARCHAR(100) UNIQUE NOT NULL,
  prompt_template TEXT NOT NULL,
  variables JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analysis_cache (
  id SERIAL PRIMARY KEY,
  url_hash VARCHAR(64) UNIQUE NOT NULL,
  crawl_data JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## File Structure
```
/seo-crawler/
├── frontend/                 # React/Next.js app
│   ├── components/
│   │   ├── URLInput.jsx
│   │   ├── ProgressTracker.jsx
│   │   ├── ResultsDashboard.jsx
│   │   └── PromptSelector.jsx
│   ├── pages/
│   │   ├── index.jsx        # Landing page
│   │   ├── analysis/[id].jsx # Results page
│   │   └── admin.jsx        # Admin panel
│   └── styles/
├── backend/                  # Node.js API
│   ├── services/
│   │   ├── crawler.js       # Web crawling service
│   │   ├── ai-analyzer.js   # AI integration
│   │   ├── prompt-manager.js
│   │   └── report-generator.js
│   ├── routes/
│   │   ├── analyze.js       # Analysis endpoints
│   │   ├── prompts.js       # Prompt management
│   │   └── reports.js       # Report generation
│   ├── models/              # Database models
│   └── config/
│       ├── database.js
│       └── ai-apis.js
├── database/
│   ├── migrations/
│   └── seeds/
└── deployment/
    ├── docker-compose.yml
    ├── vercel.json          # Frontend deployment
    └── railway.toml         # Backend deployment
```

## Environment Configuration

```env
# Required environment variables
# AI APIs
GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key  # For phase 2

# Database
DATABASE_URL=postgresql://...

# App Config  
NODE_ENV=development|production
APP_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com

# Features
ENABLE_CACHING=true
MAX_CRAWL_DEPTH=3
ANALYSIS_TIMEOUT=300000
```

## Deployment Strategy

### Phase 1: Free Testing
- **Frontend**: Vercel (Free tier)
- **Backend**: Railway (Free tier)  
- **Database**: Railway PostgreSQL (Free)
- **AI**: Gemini API (Free)
- **Total Cost**: $0/month

### Phase 2: Production
- **Frontend**: Vercel Pro ($20/month) OR Digital Ocean Static Sites (Free)
- **Backend**: Digital Ocean Droplet ($6/month) OR Railway ($10-20/month)
- **Database**: Self-hosted PostgreSQL OR managed database
- **AI**: Gemini (free) + Claude API (usage-based)
- **Total Cost**: $6-50/month depending on usage

## Success Metrics

### Technical Metrics
- **Crawl Success Rate**: >95% of submitted URLs successfully crawled
- **Analysis Time**: <60 seconds from URL submission to AI analysis
- **API Response Time**: <3 seconds for analysis endpoints
- **Uptime**: >99% availability

### User Experience Metrics  
- **Analysis Accuracy**: AI recommendations should be actionable and relevant
- **Report Quality**: Professional PDF reports with clear recommendations
- **User Retention**: Track repeat usage and analysis history

## Future Enhancements (Phase 3+)

### Advanced Features
- **Bulk Analysis**: Upload CSV of URLs for batch processing
- **Competitor Comparison**: Side-by-side SEO analysis
- **Progress Tracking**: Monitor SEO improvements over time  
- **White Label**: Custom branding for agencies
- **API Access**: Allow third-party integrations
- **Webhooks**: Integration with other marketing tools

### AI Enhancements
- **Custom Training**: Fine-tune prompts based on user feedback
- **Industry-Specific Analysis**: Tailored prompts for different sectors
- **Multi-language Support**: Analysis in different languages
- **AI-Generated Action Plans**: Detailed implementation guides

## Getting Started Commands

```bash
# Initialize project with Claude Code
cd /path/to/your/projects
claude-code create seo-crawler --template fullstack-web-app

# Install dependencies
cd seo-crawler
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start development
npm run dev
```

## Implementation Priority

### Week 1: Core Foundation
1. ✅ Project scaffolding and basic structure
2. ✅ Web crawler service with Puppeteer
3. ✅ Basic Gemini API integration
4. ✅ Simple URL input form

### Week 2: AI Analysis System
1. ✅ Prompt management system
2. ✅ AI analysis pipeline
3. ✅ Results processing and formatting
4. ✅ Basic results display

### Week 3: Professional Features
1. ✅ PDF report generation
2. ✅ Results dashboard with scores
3. ✅ Database integration for history
4. ✅ Error handling and validation

### Week 4: Production Ready
1. ✅ Performance optimization
2. ✅ Security implementations
3. ✅ Deployment configuration
4. ✅ Testing and bug fixes

## Notes for Claude Code

- **Focus on modularity**: Make AI provider switching effortless
- **Prioritize cost efficiency**: Cache crawl results, optimize API calls
- **User experience first**: Clear progress indicators, helpful error messages
- **Professional output**: Reports should look like they came from an established SEO agency
- **Scalability**: Code should handle growth from 10 to 10,000 analyses per month

This specification provides a complete blueprint for building a professional SEO analysis platform. Start with the core crawler + Gemini integration, then expand features based on user feedback and requirements.