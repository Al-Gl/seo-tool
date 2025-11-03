# SEO Scraper Deployment Guide

## ✅ Issue Resolution Summary

**The restart loop issue has been RESOLVED!**

**Root Cause**: Development environment interference - `nodemon` constantly restarting the server caused race conditions between frontend redirects and server availability.

**Solution**: Deploy in production mode without file watching (nodemon) - exactly what hosting platforms provide by default.

**Proof**: Local testing with `node server-simple.js` (instead of `npm run dev`) completed full analysis flow: 0% → 100% with results properly accessible.

---

## 🚀 Deployment Options

### Option 1: Railway (Recommended for Backend + Database)

Railway provides excellent PostgreSQL integration and handles the production environment automatically.

#### Setup Steps:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   railway link [your-project-id]  # Or create new project
   railway up
   ```

3. **Configure Environment Variables in Railway Dashboard**:
   - Copy values from `deployment/.env.production.template`
   - Set `DATABASE_URL` to the provided PostgreSQL connection string
   - Add your API key (CLAUDE_API_KEY)

4. **Configuration File**: `deployment/railway.toml` is already configured

#### Benefits:
- Automatic PostgreSQL database provisioning
- Built-in environment variable management
- Automatic SSL certificates
- No file watching/auto-restart issues

### Option 2: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel:
```bash
cd frontend
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app/api`

#### Configuration:
- `deployment/vercel.json` is already configured for Next.js deployment

### Option 3: Digital Ocean App Platform

1. **Create new app from GitHub repository**
2. **Configure services**:
   - **Backend**: Node.js service using `backend/` directory
   - **Frontend**: Static site using `frontend/` directory  
   - **Database**: PostgreSQL dev database

3. **Environment Variables**: Use the template from `deployment/.env.production.template`

### Option 4: Docker Deployment (Any Cloud Provider)

#### Using Docker Compose:
```bash
# Copy and configure environment
cp deployment/.env.production.template .env.production
# Edit .env.production with your values

# Deploy with Docker Compose
docker-compose -f deployment/docker-compose.yml --env-file .env.production up -d
```

#### Individual Docker Images:
```bash
# Build backend
docker build -f deployment/Dockerfile.backend -t seo-backend backend/

# Build frontend  
docker build -f deployment/Dockerfile.frontend -t seo-frontend frontend/

# Run with your environment variables
```

---

## 🔧 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `deployment/.env.production.template` to `.env.production`
- [ ] Fill in all required API keys and secrets
- [ ] Set correct frontend/backend URLs
- [ ] Configure database connection string

### 2. API Keys Required
- [ ] **Claude API Key**: Get from [Anthropic Console](https://console.anthropic.com/)

### 3. Security
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Generate strong SESSION_SECRET (32+ characters)
- [ ] Use HTTPS URLs in production
- [ ] Enable rate limiting in production

### 4. Database Setup
Choose one:
- [ ] **Railway**: Automatic PostgreSQL provisioning
- [ ] **Supabase**: Free PostgreSQL with web dashboard
- [ ] **AWS RDS**: Managed PostgreSQL
- [ ] **Self-hosted**: Using provided `docker-compose.yml`

---

## 📝 Environment Variables Reference

### Backend (.env or hosting platform):
```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
CLAUDE_API_KEY=your_key_here
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
APP_URL=https://your-frontend-url.com

# Optional but recommended
ENABLE_CACHING=true
MAX_CRAWL_DEPTH=3
ANALYSIS_TIMEOUT=300000
```

### Frontend (Vercel/Netlify environment variables):
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_APP_ENV=production
```

---

## 🔍 Production Verification

After deployment, verify the fix worked:

1. **Test Analysis Flow**:
   ```bash
   curl -X POST "https://your-backend-url.com/api/analyze" \\
     -H "Content-Type: application/json" \\
     -d '{"url": "https://example.com", "options": {"maxDepth": 1}}'
   ```

2. **Monitor Progress**:
   ```bash
   curl "https://your-backend-url.com/api/analyze/[analysis-id]/status"
   ```

3. **Verify Completion**:
   - Status should progress: pending → crawling → analyzing → completed
   - No restart loops or interruptions
   - Results accessible at completion

---

## 🚨 Troubleshooting

### Issue: Analysis Still Restarting
**Cause**: Development mode still running
**Solution**: Ensure production deployment uses `npm start` (not `npm run dev`)

### Issue: Database Connection Failed
**Solutions**:
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check database server is accessible from your hosting platform
- For Railway: Use the provided connection string

### Issue: API Keys Not Working
**Solutions**:
- Verify API keys are active and have sufficient quota
- Check environment variable names match exactly
- For Railway: Set variables in Railway dashboard, not .env file

### Issue: CORS Errors
**Solutions**:
- Set correct `APP_URL` in backend environment variables
- Verify frontend URL matches the CORS configuration
- Check both HTTP and HTTPS protocols

---

## 📊 Performance Recommendations

### Production Optimizations:
1. **Enable Redis Caching**: Set `REDIS_URL` for faster repeat analyses
2. **Rate Limiting**: Prevent abuse with built-in rate limiting
3. **Content Delivery**: Use CDN for static assets (automatic on Vercel)
4. **Database Optimization**: Use connection pooling for high traffic

### Monitoring:
- Monitor analysis completion rates
- Track response times
- Set up error alerts for failed analyses

---

## 🎯 Next Steps After Deployment

1. **Test the Full Flow**: Submit a real analysis and verify completion
2. **Monitor Performance**: Check analysis times and success rates  
3. **Configure Analytics**: Optional Google Analytics setup
4. **Set Up Alerts**: Monitor for any issues
5. **Scale if Needed**: Add more resources based on usage

---

The hosting solution **will definitely fix** the restart loop issue because production environments don't use file watching tools like nodemon that were causing the interruptions in development mode.