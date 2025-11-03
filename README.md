# SEO Crawler & AI Analysis Platform

A comprehensive web-based SEO analysis platform that crawls websites and uses AI (Claude API) to provide intelligent SEO recommendations. Built with Next.js, Node.js, Express, PostgreSQL, and Anthropic Claude API.

## 🚀 Features

- **Web Crawling**: Comprehensive website analysis using Puppeteer
- **AI-Powered Analysis**: Intelligent SEO recommendations using Anthropic Claude API  
- **Multiple Analysis Types**: SEO Audit, Content Analysis, Technical SEO, Competitor Analysis, Local SEO
- **Real-time Progress**: Live updates during analysis
- **Professional Reports**: PDF generation with detailed insights
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with Tailwind CSS

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Components**: Reusable UI components with proper TypeScript types
- **Features**: Real-time progress tracking, results dashboard, PDF export

### Backend (Node.js/Express)
- **Framework**: Express.js with TypeScript
- **Web Crawler**: Puppeteer for comprehensive site analysis
- **AI Integration**: Anthropic Claude API with configurable prompts
- **Database**: PostgreSQL with UUID primary keys
- **API**: RESTful endpoints with proper validation

### Database (PostgreSQL)
- **Tables**: analyses, prompt_templates, analysis_cache, reports
- **Features**: UUID keys, JSONB columns, automatic timestamps
- **Performance**: Proper indexing and caching system

## 📁 Project Structure

```
seo-crawler-platform/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Next.js pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and API client
│   │   └── types/           # TypeScript definitions
├── backend/                  # Node.js Express API
│   ├── services/            # Business logic services
│   ├── routes/              # API route handlers
│   ├── models/              # Database models
│   └── config/              # Configuration files
├── database/                # Database setup and migrations
│   ├── migrations/          # SQL migration files
│   └── seeds/               # Default data seeds
└── deployment/              # Docker and deployment configs
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn
- Anthropic Claude API key

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd seo-crawler-platform

# Install all dependencies (root, frontend, backend)
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration:
# CLAUDE_API_KEY=your_claude_api_key_here
# DATABASE_URL=postgresql://username:password@localhost:5432/seo_crawler
```

### 3. Database Setup
```bash
# Create database
createdb seo_crawler

# Initialize database with schema and seeds
npm run db:setup

# Or step by step:
npm run db:migrate  # Run migrations only
npm run db:seed     # Seed default data only
```

### 4. Development Mode
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend: http://localhost:3000
npm run dev:backend   # Backend: http://localhost:3001
```

### 5. Production Build
```bash
# Build both applications
npm run build

# Start production servers
npm start
```

## 🐳 Docker Deployment

### Local Development with Docker
```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Production Deployment

#### Option 1: Vercel (Frontend) + Railway (Backend)
1. **Frontend on Vercel**:
   ```bash
   # Deploy frontend
   cd frontend
   vercel --prod
   ```

2. **Backend on Railway**:
   - Connect your GitHub repository
   - Configure environment variables
   - Railway will auto-deploy from `backend/` directory

#### Option 2: Digital Ocean / AWS / GCP
- Use provided Docker configurations
- Set up PostgreSQL database
- Configure environment variables
- Deploy using docker-compose

## 📋 API Documentation

### Analysis Endpoints
- `POST /api/analyze` - Submit URL for analysis
- `GET /api/analyze/:id` - Get analysis results
- `GET /api/analyze` - List all analyses
- `DELETE /api/analyze/:id` - Delete analysis

### Prompt Management
- `GET /api/prompts` - Get available prompts
- `POST /api/prompts` - Create new prompt template

### Reports
- `GET /api/reports/:id/pdf` - Download PDF report

### Health Check
- `GET /health` - System health status

## 🔧 Configuration

### Environment Variables
```env
# AI APIs
CLAUDE_API_KEY=your_claude_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# App Configuration
NODE_ENV=development|production
APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001

# Features
ENABLE_CACHING=true
MAX_CRAWL_DEPTH=3
ANALYSIS_TIMEOUT=300000
```

### Available Analysis Types
1. **Complete SEO Audit** - Comprehensive analysis
2. **Content Analysis** - Focus on content quality
3. **Technical SEO** - Performance and technical issues
4. **Competitor Analysis** - Industry benchmarking
5. **Local SEO** - Location-based optimization
6. **Custom Analysis** - User-defined prompts

## 🔍 Usage Examples

### Submit Analysis via API
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "promptType": "seo-audit"
  }'
```

### Get Analysis Results
```bash
curl http://localhost:3001/api/analyze/{analysis-id}
```

### Download PDF Report
```bash
curl http://localhost:3001/api/reports/{analysis-id}/pdf > report.pdf
```

## 📊 Monitoring & Maintenance

### Database Maintenance
```bash
# Reset database (development only)
npm run db:reset

# Test database connection
npm run db:test
```

### Logs and Monitoring
- Application logs available in console output
- Health checks available at `/health` endpoints
- Database query performance via PostgreSQL logs

## 🚀 Performance Optimization

### Backend Optimizations
- Connection pooling for database
- Puppeteer browser instance reuse
- Response caching for repeated URLs
- Async processing for long-running analyses

### Frontend Optimizations
- Next.js automatic code splitting
- Image optimization
- Static generation where possible
- React Query caching for API responses

## 🔐 Security Features

- Input validation with Joi schemas
- SQL injection prevention with parameterized queries
- CORS protection
- Rate limiting (configurable)
- Secure headers with Helmet.js
- Environment variable protection

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📈 Scaling Considerations

### Performance Scaling
- **Horizontal scaling**: Multiple backend instances behind load balancer
- **Database scaling**: Read replicas, connection pooling
- **Caching**: Redis for session/cache storage
- **CDN**: Static asset delivery via CDN

### Cost Optimization
- **Claude API**: Usage-based pricing with generous rate limits
- **Database**: Start with managed PostgreSQL
- **Hosting**: Vercel (frontend) + Railway (backend) for cost-effective start

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Run `npm run db:test`

2. **Puppeteer Issues**
   - Install system dependencies for Chromium
   - Check Docker configuration for headless Chrome

3. **API Key Issues**
   - Verify Claude API key is valid
   - Check API quotas and rate limits

### Getting Help
- Create an issue in the repository
- Check existing issues for solutions
- Review logs for error details

---

Built with ❤️ using Next.js, Node.js, PostgreSQL, and Anthropic Claude AI.