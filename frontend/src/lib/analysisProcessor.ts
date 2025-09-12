import { AnalysisResponse } from '@/types';

export interface ProcessedIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'suggestion';
  category: 'technical' | 'content' | 'performance' | 'accessibility';
  impact: number;
}

export interface CategoryScores {
  technicalScore: number;
  contentScore: number;
  performanceScore: number;
  accessibilityScore: number;
  overallScore: number;
}

export interface ProcessedAnalysisData {
  issues: ProcessedIssue[];
  categoryScores: CategoryScores;
  issueCounts: {
    critical: number;
    warning: number;
    suggestion: number;
  };
}

export function processAnalysisData(results: AnalysisResponse): ProcessedAnalysisData {
  const issues: ProcessedIssue[] = [];
  let issueId = 1;

  // Check if we have crawl data
  const crawlData = results.crawlData;
  if (!crawlData) {
    return {
      issues: [],
      categoryScores: {
        technicalScore: 0,
        contentScore: 0,
        performanceScore: 0,
        accessibilityScore: 0,
        overallScore: 0
      },
      issueCounts: { critical: 0, warning: 0, suggestion: 0 }
    };
  }

  // Extract content data safely
  const content = crawlData.content || {};
  const title = content.title || '';
  const description = content.description || '';
  const headings = content.headings || {};
  const h1Tags = headings.h1 || [];
  const images = content.images || [];
  const performance = crawlData.performance || {};
  const loadTime = performance.loadTime || 0;

  // Rule 1: Title Too Long
  if (title.length > 60) {
    issues.push({
      id: `issue-${issueId++}`,
      title: 'Title Too Long',
      description: `Page title is ${title.length} characters long. Titles should be 60 characters or less for optimal SEO.`,
      severity: 'warning',
      category: 'content',
      impact: 7
    });
  }

  // Rule 2: Meta Description Length
  if (description.length < 70 || description.length > 160) {
    const severity = description.length === 0 ? 'critical' : 'warning';
    issues.push({
      id: `issue-${issueId++}`,
      title: 'Meta Description Length Issue',
      description: description.length === 0 
        ? 'No meta description found. Meta descriptions should be 70-160 characters long.'
        : `Meta description is ${description.length} characters long. Optimal length is 70-160 characters.`,
      severity,
      category: 'content',
      impact: description.length === 0 ? 9 : 6
    });
  }

  // Rule 3: H1 Tag Issues
  if (h1Tags.length !== 1) {
    const severity = h1Tags.length === 0 ? 'critical' : 'warning';
    issues.push({
      id: `issue-${issueId++}`,
      title: 'H1 Tag Issue',
      description: h1Tags.length === 0 
        ? 'No H1 tag found. Every page should have exactly one H1 tag.'
        : `Found ${h1Tags.length} H1 tags. Every page should have exactly one H1 tag.`,
      severity,
      category: 'technical',
      impact: h1Tags.length === 0 ? 8 : 5
    });
  }

  // Rule 4: Images Missing Alt Text
  const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '');
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      id: `issue-${issueId++}`,
      title: 'Images Missing Alt Text',
      description: `${imagesWithoutAlt.length} image(s) are missing alt text. Alt text is important for accessibility and SEO.`,
      severity: 'warning',
      category: 'accessibility',
      impact: 6
    });
  }

  // Rule 5: Slow Page Load Time
  if (loadTime > 3000) {
    const severity = loadTime > 5000 ? 'critical' : 'warning';
    issues.push({
      id: `issue-${issueId++}`,
      title: 'Slow Page Load Time',
      description: `Page load time is ${(loadTime / 1000).toFixed(1)} seconds. Pages should load in under 3 seconds for optimal user experience.`,
      severity,
      category: 'performance',
      impact: loadTime > 5000 ? 9 : 7
    });
  }

  // Calculate category scores
  const categoryScores = calculateCategoryScores(issues);

  // Count issues by severity
  const issueCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    suggestion: issues.filter(i => i.severity === 'suggestion').length,
  };

  return {
    issues,
    categoryScores,
    issueCounts
  };
}

function calculateCategoryScores(issues: ProcessedIssue[]): CategoryScores {
  // Start each category at 100
  let technicalScore = 100;
  let contentScore = 100;
  let performanceScore = 100;
  let accessibilityScore = 100;

  // Subtract points based on issues
  issues.forEach(issue => {
    const deduction = getScoreDeduction(issue.severity, issue.impact);
    
    switch (issue.category) {
      case 'technical':
        technicalScore = Math.max(0, technicalScore - deduction);
        break;
      case 'content':
        contentScore = Math.max(0, contentScore - deduction);
        break;
      case 'performance':
        performanceScore = Math.max(0, performanceScore - deduction);
        break;
      case 'accessibility':
        accessibilityScore = Math.max(0, accessibilityScore - deduction);
        break;
    }
  });

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (technicalScore * 0.30 + 
     contentScore * 0.30 + 
     performanceScore * 0.25 + 
     accessibilityScore * 0.15)
  );

  return {
    technicalScore: Math.round(technicalScore),
    contentScore: Math.round(contentScore),
    performanceScore: Math.round(performanceScore),
    accessibilityScore: Math.round(accessibilityScore),
    overallScore
  };
}

function getScoreDeduction(severity: string, impact: number): number {
  const baseDeduction = {
    critical: 25,
    warning: 15,
    suggestion: 5
  };

  const base = baseDeduction[severity as keyof typeof baseDeduction] || 10;
  // Scale by impact (1-10 scale)
  return Math.round(base * (impact / 10));
}

export function getScoreWeightingTooltip(): string {
  return 'Overall Score Calculation:\n• Technical SEO: 30%\n• Content Quality: 30%\n• Performance: 25%\n• Accessibility: 15%';
}