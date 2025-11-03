# Troubleshooting Guide

## Analysis Fails with Error Message

If you receive an error message when running an analysis, follow these steps to diagnose and fix the issue.

### Quick Diagnostics

Run the service test script to check all components:

```bash
cd backend
npm run test:services
```

This will test:
- Environment variables
- Database connection
- Puppeteer/Browser
- Claude API connection

### Common Issues and Solutions

#### 1. Database Connection Errors

**Error**: "Database connection failed" or "Database error occurred"

**Causes**:
- PostgreSQL is not running
- Incorrect DATABASE_URL in `.env` file
- Database doesn't exist

**Solutions**:
```bash
# Check if PostgreSQL is running (Windows)
# Open Services and look for PostgreSQL

# Or check via command line
psql --version

# Connect to database manually to test
psql postgresql://postgres:password@localhost:5432/seo_crawler

# If database doesn't exist, create it
createdb seo_crawler
```

**Fix .env file**:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/seo_crawler
```

---

#### 2. Puppeteer/Browser Errors

**Error**: "Failed to start browser" or "Our analysis service is currently unavailable"

**Causes**:
- Chromium dependencies missing (common on Windows)
- Puppeteer not installed correctly
- Permission issues

**Solutions**:
```bash
# Reinstall Puppeteer
cd backend
npm uninstall puppeteer
npm install puppeteer

# On Windows, you may need to install Windows Build Tools
npm install --global windows-build-tools

# Test Puppeteer directly
node -e "const puppeteer = require('puppeteer'); puppeteer.launch().then(browser => { console.log('Success!'); browser.close(); });"
```

---

#### 3. Claude API Errors

**Error**: "AI analysis encountered an error"

**Causes**:
- Missing or invalid CLAUDE_API_KEY
- API rate limits
- Network issues

**Solutions**:
```bash
# Verify API key is set
cat backend/.env | grep CLAUDE_API_KEY

# Test API key manually
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

**Get a new API key**:
1. Visit https://console.anthropic.com/
2. Create or log into your account
3. Go to API Keys section
4. Create a new key
5. Update `backend/.env` with the new key

---

#### 4. URL Loading Errors

**Error**: "Failed to load URL" or "Website returned error status XXX"

**Causes**:
- Invalid URL format
- Website is down or blocking bots
- Network timeout

**Solutions**:
- Check URL format: must include `http://` or `https://`
- Try the URL in your browser first
- Check if the website has bot protection
- Some websites block automated tools

**Valid URL examples**:
```
✅ https://example.com
✅ http://www.example.com/page
❌ example.com (missing protocol)
❌ www.example.com (missing protocol)
```

---

#### 5. Timeout Errors

**Error**: "The website took too long to respond"

**Causes**:
- Slow website
- Network issues
- Heavy page with lots of resources

**Solutions**:
Increase timeout in `backend/services/crawler.js`:
```javascript
this.options = {
  timeout: options.timeout || 60000, // Increase from 30000 to 60000
  // ...
};
```

---

### Step-by-Step Debugging

#### 1. Check Backend Logs

Start the backend and watch the console:
```bash
cd backend
npm run dev
```

Look for error messages when submitting an analysis.

#### 2. Check Frontend Console

Open browser DevTools (F12) and check the Console tab for errors.

#### 3. Test Backend Directly

Use curl or Postman to test the API:
```bash
# Health check
curl http://localhost:3001/api/health

# Submit analysis
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

#### 4. Check Database

```bash
# Connect to database
psql postgresql://postgres:password@localhost:5432/seo_crawler

# Check analyses table
SELECT id, url, status, error_message FROM analyses ORDER BY created_at DESC LIMIT 5;

# Check for failed analyses
SELECT * FROM analyses WHERE status = 'failed' ORDER BY created_at DESC LIMIT 1;
```

---

### Environment Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js 18+ installed
- [ ] All npm packages installed (`npm install` in both `backend` and `frontend`)
- [ ] `.env` file exists in `backend/` directory
- [ ] `DATABASE_URL` is correct in `.env`
- [ ] `CLAUDE_API_KEY` is set in `.env`
- [ ] Database tables created (run backend once to initialize)
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] No firewall blocking localhost connections

---

### Still Having Issues?

1. **Run the diagnostic script**: `npm run test:services` in the backend folder
2. **Check the logs**: Both backend console and frontend browser console
3. **Try a simple URL first**: Test with `https://example.com`
4. **Clear and restart**: Stop all services, restart PostgreSQL, restart backend and frontend

### Getting Help

When reporting an issue, include:
- Error message from the UI
- Backend console logs
- Result of `npm run test:services`
- Your operating system
- Node.js version (`node --version`)
- PostgreSQL version (`psql --version`)
