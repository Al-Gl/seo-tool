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
    console.log('[Crawler Step 1] Starting crawlUrl function for:', url);
    try {
      if (!this.browser) {
        console.log('[Crawler] Initializing browser...');
        await this.initialize();
        console.log('[Crawler] Browser initialized successfully');
      }
    } catch (initError) {
      console.error('[Crawler] Browser initialization failed:', initError);
      throw new Error(`Failed to start browser: ${initError.message}. This may be due to missing Chromium dependencies on your system.`);
    }

    console.log('[Crawler Step 2] Creating new page...');
    const page = await this.browser.newPage();

    try {
      // Set user agent, viewport, and UTF-8 encoding headers
      console.log('[Crawler Step 3] Setting user agent, viewport, and encoding...');
      await page.setUserAgent(this.options.userAgent);
      await page.setViewport(this.options.viewport);

      // Force UTF-8 character handling
      await page.setExtraHTTPHeaders({
        'Accept-Charset': 'utf-8',
        'Accept-Language': 'da,en;q=0.9,*;q=0.8' // Prioritize Danish and English
      });

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
      let response;
      try {
        response = await page.goto(url, {
          waitUntil: ['networkidle0', 'domcontentloaded'],
          timeout: this.options.timeout
        });
      } catch (navError) {
        console.error('[Crawler] Navigation failed:', navError.message);
        throw new Error(`Failed to load URL "${url}": ${navError.message}. Please check if the URL is correct and accessible.`);
      }

      const loadTime = Date.now() - startTime;
      console.log(`[Crawler Step 5] Navigation complete with status: ${response.status()}`);

      if (!response || !response.ok()) {
        const statusCode = response ? response.status() : 'unknown';
        throw new Error(`Website returned error status ${statusCode}. Please check if the URL is correct and the website is online.`);
      }


      // Extract comprehensive page data
      console.log('[Crawler Step 6] Evaluating page content...');

      const pageData = await page.evaluate(() => {
        // Ensure proper Unicode/UTF-8 handling in evaluation context
        const data = {
          url: window.location.href,
          title: document.title || '',
          description: '',
          keywords: '',
          canonical: '',
          robots: '',
          lang: document.documentElement.lang || '',
          charset: document.characterSet || 'UTF-8',
          
          // Content analysis with UTF-8 preservation
          content: {
            textContent: document.body ? document.body.innerText : '',
            htmlContent: document.body ? document.body.innerHTML : '',
            wordCount: 0,
            paragraphs: document.querySelectorAll('p').length,
            images: document.querySelectorAll('img').length,
            hasSpecialChars: false, // Will be set based on content analysis
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

        // Extract canonical URL with proper attribute handling
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          // Use getAttribute first, fallback to href property
          data.canonical = canonical.getAttribute('href') || canonical.href || '';

          // Convert relative URLs to absolute URLs
          if (data.canonical && !data.canonical.startsWith('http')) {
            try {
              data.canonical = new URL(data.canonical, window.location.origin).href;
            } catch (e) {
              console.warn('Error converting relative canonical URL:', e);
            }
          }
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

        // Content analysis with special character detection
        if (data.content.textContent && typeof data.content.textContent === 'string') {
          // Fix word count calculation with proper validation
          const textForCounting = data.content.textContent.trim();
          data.content.wordCount = textForCounting.length > 0 ?
            textForCounting.split(/\s+/).filter(word => word.length > 0).length : 0;

          // Detect special characters (Danish, German, French, etc.)
          const specialCharPattern = /[øæåüßéèçàáíóúñ]/i;
          data.content.hasSpecialChars = specialCharPattern.test(data.content.textContent) ||
                                       specialCharPattern.test(data.title) ||
                                       specialCharPattern.test(data.description);
        } else {
          // Fallback: set word count to 0 if no valid text content
          data.content.wordCount = 0;
          data.content.hasSpecialChars = false;
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
      
      // Get Core Web Vitals and detailed performance metrics
      const coreWebVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {
            lcp: null,
            fid: null,
            cls: null,
            fcp: null,
            ttfb: null
          };

          try {
            // Check if PerformanceObserver is available
            if ('PerformanceObserver' in window) {
              let metricsCollected = 0;
              const totalMetrics = 3; // LCP, FID, CLS
              const timeout = setTimeout(() => resolve(vitals), 3000); // 3 second timeout

              // LCP (Largest Contentful Paint)
              const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries.length > 0) {
                  vitals.lcp = Math.round(entries[entries.length - 1].startTime);
                  metricsCollected++;
                  if (metricsCollected === totalMetrics) {
                    clearTimeout(timeout);
                    resolve(vitals);
                  }
                }
              });

              // FID (First Input Delay)
              const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries.length > 0) {
                  vitals.fid = Math.round(entries[0].processingStart - entries[0].startTime);
                  metricsCollected++;
                  if (metricsCollected === totalMetrics) {
                    clearTimeout(timeout);
                    resolve(vitals);
                  }
                }
              });

              // CLS (Cumulative Layout Shift)
              let clsValue = 0;
              const clsObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                  if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                  }
                }
                vitals.cls = Math.round(clsValue * 1000) / 1000; // Round to 3 decimal places
                metricsCollected++;
                if (metricsCollected === totalMetrics) {
                  clearTimeout(timeout);
                  resolve(vitals);
                }
              });

              // Start observing
              lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
              fidObserver.observe({ entryTypes: ['first-input'] });
              clsObserver.observe({ entryTypes: ['layout-shift'] });

              // Get additional timing metrics
              if (performance.timing) {
                vitals.fcp = performance.getEntriesByType('paint')
                  .find(entry => entry.name === 'first-contentful-paint')?.startTime || null;
                vitals.ttfb = performance.timing.responseStart - performance.timing.navigationStart;
              }
            } else {
              resolve(vitals);
            }
          } catch (error) {
            console.log('Error collecting Core Web Vitals:', error);
            resolve(vitals);
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
          coreWebVitals: coreWebVitals,
          scores: {
            performance: this.calculatePerformanceScore(loadTime, coreWebVitals),
            lcp: this.scoreLCP(coreWebVitals.lcp),
            fid: this.scoreFID(coreWebVitals.fid),
            cls: this.scoreCLS(coreWebVitals.cls),
            fcp: this.scoreFCP(coreWebVitals.fcp),
            ttfb: this.scoreTTFB(coreWebVitals.ttfb)
          }
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
      console.error(`[Crawler] Failed to crawl ${url}:`, error.message);
      console.error(`[Crawler] Error stack:`, error.stack);
      // Re-throw with more context if it's not already a detailed error
      if (error.message && error.message.includes('Failed to')) {
        throw error;
      } else {
        throw new Error(`Crawling failed: ${error.message}`);
      }
    } finally {
      if (page && !page.isClosed()) {
        console.log('[Crawler] Closing page...');
        await page.close();
      }
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
   * Calculate overall performance score based on Core Web Vitals and load time
   * @param {number} loadTime - Page load time in milliseconds
   * @param {Object} vitals - Core Web Vitals metrics
   * @returns {number} Performance score (0-100)
   */
  calculatePerformanceScore(loadTime, vitals) {
    let score = 0;
    let components = 0;

    // Load time score (25% weight)
    if (loadTime) {
      score += this.scoreLoadTime(loadTime) * 0.25;
      components++;
    }

    // LCP score (25% weight)
    if (vitals.lcp !== null) {
      score += this.scoreLCP(vitals.lcp) * 0.25;
      components++;
    }

    // FID score (20% weight)
    if (vitals.fid !== null) {
      score += this.scoreFID(vitals.fid) * 0.20;
      components++;
    }

    // CLS score (20% weight)
    if (vitals.cls !== null) {
      score += this.scoreCLS(vitals.cls) * 0.20;
      components++;
    }

    // FCP score (10% weight)
    if (vitals.fcp !== null) {
      score += this.scoreFCP(vitals.fcp) * 0.10;
      components++;
    }

    return components > 0 ? Math.round(score * (5 / components)) : 50; // Normalize if some metrics are missing
  }

  /**
   * Score load time performance
   * @param {number} loadTime - Load time in milliseconds
   * @returns {number} Score (0-100)
   */
  scoreLoadTime(loadTime) {
    if (loadTime <= 1500) return 100; // Excellent
    if (loadTime <= 2500) return 90;  // Good
    if (loadTime <= 3500) return 75;  // Fair
    if (loadTime <= 5000) return 50;  // Poor
    return 25; // Very poor
  }

  /**
   * Score LCP (Largest Contentful Paint)
   * @param {number} lcp - LCP in milliseconds
   * @returns {number} Score (0-100)
   */
  scoreLCP(lcp) {
    if (lcp === null) return null;
    if (lcp <= 2500) return 100; // Good
    if (lcp <= 4000) return 75;  // Needs improvement
    return 25; // Poor
  }

  /**
   * Score FID (First Input Delay)
   * @param {number} fid - FID in milliseconds
   * @returns {number} Score (0-100)
   */
  scoreFID(fid) {
    if (fid === null) return null;
    if (fid <= 100) return 100; // Good
    if (fid <= 300) return 75;  // Needs improvement
    return 25; // Poor
  }

  /**
   * Score CLS (Cumulative Layout Shift)
   * @param {number} cls - CLS score
   * @returns {number} Score (0-100)
   */
  scoreCLS(cls) {
    if (cls === null) return null;
    if (cls <= 0.1) return 100; // Good
    if (cls <= 0.25) return 75; // Needs improvement
    return 25; // Poor
  }

  /**
   * Score FCP (First Contentful Paint)
   * @param {number} fcp - FCP in milliseconds
   * @returns {number} Score (0-100)
   */
  scoreFCP(fcp) {
    if (fcp === null) return null;
    if (fcp <= 1800) return 100; // Good
    if (fcp <= 3000) return 75;  // Needs improvement
    return 25; // Poor
  }

  /**
   * Score TTFB (Time to First Byte)
   * @param {number} ttfb - TTFB in milliseconds
   * @returns {number} Score (0-100)
   */
  scoreTTFB(ttfb) {
    if (ttfb === null) return null;
    if (ttfb <= 600) return 100;  // Good
    if (ttfb <= 1500) return 75;  // Needs improvement
    return 25; // Poor
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