/**
 * Web Crawler Service
 * Handles web scraping and data extraction using Puppeteer
 */

const puppeteer = require('puppeteer');

/**
 * Web Crawler Class
 * Provides comprehensive web crawling capabilities with SEO-focused data extraction
 */
class WebCrawler {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 30000,
      userAgent: options.userAgent || 'SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)',
      viewport: options.viewport || { width: 1366, height: 768 },
      waitForSelector: options.waitForSelector || 'body',
      ...options
    };
    this.browser = null;
  }

  /**
   * Initialize the browser instance
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        defaultViewport: this.options.viewport
      });
      console.log('Browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  /**
   * Crawl a single URL and extract comprehensive data
   * @param {string} url - The URL to crawl
   * @returns {Promise<Object>} Extracted data
   */
  async crawlUrl(url) {
    console.log('[Crawler Step 1] Starting crawlUrl function...');
    if (!this.browser) {
      await this.initialize();
    }
    console.log('[Crawler Step 2] Creating new page...');
    const page = await this.browser.newPage();
    
    try {
      // Set user agent and viewport
      console.log('[Crawler Step 3] Setting user agent and viewport...');
      await page.setUserAgent(this.options.userAgent);
      await page.setViewport(this.options.viewport);

      // Enable request interception for performance monitoring
      await page.setRequestInterception(true);
      
      const resources = {
        requests: 0,
        responses: 0,
        errors: 0,
        totalSize: 0,
        loadTimes: []
      };

      page.on('request', (request) => {
        resources.requests++;
        request.continue();
      });

      page.on('response', (response) => {
        resources.responses++;
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          resources.totalSize += parseInt(contentLength);
        }
      });

      page.on('requestfailed', (request) => {
        resources.errors++;
        console.log('Request failed:', request.url(), request.failure().errorText);
      });

      // Navigate to the URL
      console.log(`[Crawler Step 4] Navigating to URL: ${url}`);
      const startTime = Date.now();
      const response = await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: this.options.timeout
      });
      const loadTime = Date.now() - startTime;
      console.log(`[Crawler Step 5] Navigation complete with status: ${response.status()}`);

      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response ? response.status() : 'No response'}`);
      }

      // Wait for the page to be fully rendered
      await page.waitForSelector(this.options.waitForSelector, { timeout: 10000 });
      await new Promise(r => setTimeout(r, 2000)); // Additional wait for dynamic content

      // Extract comprehensive page data
      console.log('[Crawler Step 6] Evaluating page content...');
      const pageData = await page.evaluate(() => {
        const data = {
          url: window.location.href,
          title: document.title || '',
          description: '',
          keywords: '',
          canonical: '',
          robots: '',
          lang: document.documentElement.lang || '',
          charset: document.characterSet || '',
          
          // Content analysis
          content: {
            textContent: document.body ? document.body.innerText : '',
            wordCount: 0,
            paragraphs: document.querySelectorAll('p').length,
            images: document.querySelectorAll('img').length,
            links: {
              internal: 0,
              external: 0,
              total: document.querySelectorAll('a[href]').length
            }
          },

          // SEO elements
          headings: {
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: []
          },

          // Meta tags
          metaTags: {},

          // Open Graph tags
          openGraph: {},

          // Twitter Card tags
          twitterCard: {},

          // Schema markup
          schemaMarkup: [],

          // Images with SEO data
          images: [],

          // Links analysis
          links: [],

          // Technical SEO
          technical: {
            hasH1: false,
            h1Count: 0,
            hasMetaDescription: false,
            hasMetaKeywords: false,
            hasCanonical: false,
            hasRobots: false,
            hasViewport: false,
            hasSSL: window.location.protocol === 'https:',
            hasFavicon: false
          }
        };

        // Extract meta tags
        document.querySelectorAll('meta').forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
          const content = meta.getAttribute('content');
          
          if (name && content) {
            data.metaTags[name] = content;
            
            // Extract specific meta data
            if (name === 'description') data.description = content;
            if (name === 'keywords') data.keywords = content;
            if (name === 'robots') data.robots = content;
            
            // Open Graph
            if (name.startsWith('og:')) {
              data.openGraph[name.replace('og:', '')] = content;
            }
            
            // Twitter Card
            if (name.startsWith('twitter:')) {
              data.twitterCard[name.replace('twitter:', '')] = content;
            }
          }
        });

        // Extract canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          data.canonical = canonical.href;
        }

        // Extract headings
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
          const elements = document.querySelectorAll(tag);
          elements.forEach(element => {
            data.headings[tag].push({
              text: element.innerText.trim(),
              position: data.headings[tag].length + 1
            });
          });
        });

        // Technical SEO checks
        data.technical.hasH1 = data.headings.h1.length > 0;
        data.technical.h1Count = data.headings.h1.length;
        data.technical.hasMetaDescription = !!data.description;
        data.technical.hasMetaKeywords = !!data.keywords;
        data.technical.hasCanonical = !!data.canonical;
        data.technical.hasRobots = !!data.robots;
        data.technical.hasViewport = !!document.querySelector('meta[name="viewport"]');
        data.technical.hasFavicon = !!document.querySelector('link[rel*="icon"]');

        // Extract images with SEO data
        document.querySelectorAll('img').forEach((img, index) => {
          data.images.push({
            src: img.src || '',
            alt: img.alt || '',
            title: img.title || '',
            width: img.width || null,
            height: img.height || null,
            loading: img.loading || '',
            hasAlt: !!img.alt,
            position: index + 1
          });
        });

        // Extract links with analysis
        const baseUrl = window.location.origin;
        document.querySelectorAll('a[href]').forEach((link, index) => {
          const href = link.href;
          const isInternal = href.startsWith(baseUrl) || href.startsWith('/') || !href.includes('://');
          
          data.links.push({
            href: href,
            text: link.innerText.trim(),
            title: link.title || '',
            rel: link.rel || '',
            target: link.target || '',
            isInternal: isInternal,
            isExternal: !isInternal,
            position: index + 1
          });
          
          if (isInternal) {
            data.content.links.internal++;
          } else {
            data.content.links.external++;
          }
        });

        // Content analysis
        if (data.content.textContent) {
          data.content.wordCount = data.content.textContent.split(/\s+/).filter(word => word.length > 0).length;
        }

        // Extract schema markup
        document.querySelectorAll('script[type="application/ld+json"]').forEach((script, index) => {
          try {
            const schemaData = JSON.parse(script.textContent);
            data.schemaMarkup.push({
              position: index + 1,
              data: schemaData
            });
          } catch (error) {
            console.log('Invalid JSON-LD schema at position', index + 1);
          }
        });

        return data;
      });
      console.log('[Crawler Step 7] Page evaluation complete.');
      
      // Get performance metrics
      const performanceMetrics = await page.metrics();
      
      // Get Core Web Vitals (if available)
      const coreWebVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          if ('web-vital' in window) {
            // This would require the web-vitals library to be loaded on the page
            resolve({});
          } else {
            resolve({});
          }
        });
      });

      // Compile final result
      const result = {
        url: pageData.url,
        crawlTime: new Date().toISOString(),
        loadTime: loadTime,
        statusCode: response.status(),
        
        // Page content
        content: pageData,
        
        // Performance data
        performance: {
          loadTime: loadTime,
          resources: resources,
          metrics: performanceMetrics,
          coreWebVitals: coreWebVitals
        },

        // SEO summary
        seoSummary: {
          hasTitle: !!pageData.title,
          titleLength: pageData.title.length,
          hasMetaDescription: pageData.technical.hasMetaDescription,
          metaDescriptionLength: pageData.description.length,
          hasH1: pageData.technical.hasH1,
          h1Count: pageData.technical.h1Count,
          imageCount: pageData.content.images,
          imagesWithoutAlt: pageData.images.filter(img => !img.hasAlt).length,
          internalLinks: pageData.content.links.internal,
          externalLinks: pageData.content.links.external,
          wordCount: pageData.content.wordCount,
          hasCanonical: pageData.technical.hasCanonical,
          hasSSL: pageData.technical.hasSSL,
          hasFavicon: pageData.technical.hasFavicon,
          hasViewport: pageData.technical.hasViewport,
          schemaMarkupCount: pageData.schemaMarkup.length
        }
      };

      console.log(`Successfully crawled: ${url} (${loadTime}ms)`);
      return result;

    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Crawl multiple URLs
   * @param {Array<string>} urls - Array of URLs to crawl
   * @param {Object} options - Crawling options
   * @returns {Promise<Array>} Array of crawl results
   */
  async crawlUrls(urls, options = {}) {
    const { concurrent = 3, delay = 1000 } = options;
    const results = [];
    const errors = [];

    // Process URLs in batches to avoid overwhelming the target server
    for (let i = 0; i < urls.length; i += concurrent) {
      const batch = urls.slice(i, i + concurrent);
      const batchPromises = batch.map(async (url) => {
        try {
          const result = await this.crawlUrl(url);
          return { success: true, url, data: result };
        } catch (error) {
          return { success: false, url, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push(result);
        }
      });

      // Add delay between batches
      if (i + concurrent < urls.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return { results, errors };
  }

  /**
   * Close the browser instance
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Browser closed');
    }
  }
}

module.exports = WebCrawler;