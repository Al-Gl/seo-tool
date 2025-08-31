-- Default prompt templates for SEO analysis
-- Seed file: 001_default_prompts.sql

INSERT INTO prompt_templates (name, template_key, prompt_template, variables, description) VALUES
(
    'Complete SEO Audit',
    'seo-audit',
    'Analyze the following website data and provide a comprehensive SEO audit. Focus on:

1. **Technical SEO Analysis**: Meta tags, headings structure, image optimization, page speed
2. **Content Quality**: Content length, readability, keyword usage, semantic structure
3. **User Experience**: Mobile responsiveness, navigation, accessibility
4. **Performance Metrics**: Load times, Core Web Vitals, resource optimization

Website Data:
- URL: {{url}}
- Title: {{title}}
- Meta Description: {{metaDescription}}
- Headings: {{headings}}
- Images: {{images}}
- Links: {{links}}
- Performance: {{performance}}
- Content: {{content}}

Provide:
- Overall SEO score (1-100)
- Top 5 critical issues requiring immediate attention
- Quick wins (easy improvements with high impact)
- Detailed recommendations with implementation priority
- Comparison with SEO best practices

Format your response in JSON with sections: score, criticalIssues, quickWins, recommendations, summary.',
    '{"url": "string", "title": "string", "metaDescription": "string", "headings": "object", "images": "array", "links": "object", "performance": "object", "content": "string"}',
    'Comprehensive SEO audit covering technical, content, and performance aspects'
),
(
    'Content Analysis Focus',
    'content-analysis',
    'Perform a detailed content analysis of the following website. Focus specifically on:

1. **Content Quality**: Writing quality, readability, engagement potential
2. **SEO Content Optimization**: Keyword density, semantic relevance, content structure
3. **Content Strategy**: Content gaps, opportunities for improvement
4. **Readability**: Reading level, sentence structure, paragraph organization

Website Data:
- URL: {{url}}
- Content: {{content}}
- Headings: {{headings}}
- Meta Tags: {{title}}, {{metaDescription}}
- Word Count: {{wordCount}}

Analyze and provide:
- Content quality score (1-100)
- Readability assessment
- Keyword optimization opportunities
- Content structure recommendations
- Suggestions for content expansion
- Competitive content opportunities

Format response in JSON with: contentScore, readability, keywordOpportunities, structureRecommendations, expansionSuggestions.',
    '{"url": "string", "content": "string", "headings": "object", "title": "string", "metaDescription": "string", "wordCount": "number"}',
    'Deep content analysis focusing on quality, optimization, and user engagement'
),
(
    'Technical SEO Audit',
    'technical-seo',
    'Conduct a technical SEO analysis focusing on website performance and code quality:

1. **Page Speed & Performance**: Core Web Vitals, loading times, resource optimization
2. **HTML Structure**: Semantic markup, heading hierarchy, schema.org implementation
3. **Mobile Optimization**: Responsive design, mobile-first indexing readiness
4. **Technical Issues**: Broken links, console errors, accessibility concerns

Technical Data:
- URL: {{url}}
- Performance Metrics: {{performance}}
- HTML Structure: {{htmlStructure}}
- Console Errors: {{consoleErrors}}
- Mobile Score: {{mobileScore}}
- Schema Markup: {{schemaMarkup}}

Provide technical recommendations:
- Technical SEO score (1-100)
- Performance optimization priorities
- Code quality improvements
- Mobile optimization steps
- Schema markup suggestions
- Accessibility enhancements

Format in JSON: technicalScore, performanceIssues, codeQuality, mobileOptimization, schemaRecommendations, accessibilityIssues.',
    '{"url": "string", "performance": "object", "htmlStructure": "object", "consoleErrors": "array", "mobileScore": "number", "schemaMarkup": "object"}',
    'Technical SEO analysis focusing on performance, code quality, and mobile optimization'
),
(
    'Competitor Analysis',
    'competitor-analysis',
    'Compare this website against SEO industry standards and best practices:

1. **Industry Benchmarking**: Compare against typical performance metrics
2. **Content Competitive Analysis**: Content depth, topics covered, content gaps
3. **Technical Competitive Edge**: Performance advantages/disadvantages
4. **SEO Opportunity Identification**: Areas for competitive advantage

Website Analysis:
- URL: {{url}}
- SEO Metrics: {{seoMetrics}}
- Content Analysis: {{content}}
- Performance Data: {{performance}}
- Industry: {{industry}}

Competitive insights:
- Competitive positioning score (1-100)
- Industry benchmark comparison
- Competitive advantages identified
- Areas needing improvement vs competitors
- Strategic SEO opportunities
- Market positioning recommendations

Format in JSON: competitiveScore, benchmarkComparison, advantages, improvementAreas, opportunities, recommendations.',
    '{"url": "string", "seoMetrics": "object", "content": "string", "performance": "object", "industry": "string"}',
    'Competitive SEO analysis and benchmarking against industry standards'
),
(
    'Local SEO Analysis',
    'local-seo',
    'Analyze the website for local search optimization opportunities:

1. **Local SEO Elements**: NAP consistency, local schema markup, location pages
2. **Google My Business Optimization**: Business information completeness
3. **Local Content Strategy**: Location-specific content, local keywords
4. **Local Link Building**: Local directory presence, community engagement

Local SEO Data:
- URL: {{url}}
- Business Information: {{businessInfo}}
- Location Data: {{locationData}}
- Local Keywords: {{localKeywords}}
- Schema Markup: {{schemaMarkup}}
- Content: {{content}}

Local SEO recommendations:
- Local SEO score (1-100)
- NAP consistency check
- Local schema implementation
- Location page optimization
- Local content opportunities
- Community engagement strategies

Format in JSON: localScore, napConsistency, schemaImplementation, locationOptimization, contentOpportunities, engagementStrategies.',
    '{"url": "string", "businessInfo": "object", "locationData": "object", "localKeywords": "array", "schemaMarkup": "object", "content": "string"}',
    'Local SEO analysis focusing on location-based search optimization'
);

-- Insert some sample analysis cache entries (for testing)
-- These would normally be created by the crawler service
INSERT INTO analysis_cache (url_hash, url, crawl_data, expires_at) VALUES
(
    'sample_hash_123',
    'https://example.com',
    '{"title": "Example Site", "metaDescription": "An example website", "headings": {"h1": ["Welcome"], "h2": ["About", "Services"]}, "performance": {"loadTime": 1200, "mobileScore": 85}}',
    NOW() + INTERVAL '7 days'
);

-- Create initial admin prompt for custom analysis
INSERT INTO prompt_templates (name, template_key, prompt_template, variables, description) VALUES
(
    'Custom Analysis Template',
    'custom-analysis',
    'Perform a custom SEO analysis based on the following requirements:

{{customRequirements}}

Website Data:
{{websiteData}}

Please provide detailed insights and actionable recommendations based on the specific analysis requirements provided above.

Format your response with clear sections and actionable recommendations.',
    '{"customRequirements": "string", "websiteData": "object"}',
    'Flexible template for custom SEO analysis requirements'
);