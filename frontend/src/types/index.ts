// Analysis Types
export interface AnalysisRequest {
  url: string;
  analysisType: AnalysisType;
  customPrompt?: string;
}

export interface AnalysisResponse {
  id: string;
  url: string;
  status: AnalysisStatus;
  analysisType: AnalysisType;
  customPrompt?: string;
  progress?: number;
  estimatedTimeRemaining?: number;
  results?: AnalysisResults;
  createdAt: string;
  updatedAt: string;
}

export type AnalysisStatus = 'pending' | 'crawling' | 'analyzing' | 'completed' | 'failed' | 'cancelled';

export type AnalysisType = 
  | 'complete-seo-audit'
  | 'content-analysis'
  | 'technical-seo'
  | 'competitor-analysis'
  | 'local-seo'
  | 'custom';

// SEO Analysis Results
export interface AnalysisResults {
  overallScore: number;
  summary: string;
  issues: SEOIssue[];
  recommendations: Recommendation[];
  metrics: SEOMetrics;
  crawlData: CrawlData;
  generatedAt: string;
}

export interface SEOIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'suggestion';
  category: SEOCategory;
  affectedPages?: string[];
  howToFix: string;
  impact: number; // 1-10 scale
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: SEOCategory;
  actionItems: ActionItem[];
  estimatedImpact: number; // 1-10 scale
  estimatedEffort: number; // 1-10 scale
}

export interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
}

export type SEOCategory = 
  | 'technical'
  | 'content'
  | 'performance'
  | 'accessibility'
  | 'mobile'
  | 'structure'
  | 'social'
  | 'local';

// SEO Metrics
export interface SEOMetrics {
  performance: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  technical: {
    metaTitleCount: number;
    metaDescriptionCount: number;
    h1Count: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
    brokenLinks: number;
  };
  content: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    duplicateContent: number;
  };
  structure: {
    urlStructureScore: number;
    navigationDepth: number;
    sitemapExists: boolean;
    robotsTxtExists: boolean;
    schemaMarkupCount: number;
  };
}

// Crawl Data
export interface CrawlData {
  baseUrl: string;
  pagesFound: number;
  pagesCrawled: number;
  crawlDepth: number;
  crawlTime: number;
  pages: PageData[];
  errors: CrawlError[];
}

export interface PageData {
  url: string;
  title?: string;
  metaDescription?: string;
  statusCode: number;
  loadTime: number;
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  h1Tags: string[];
  h2Tags: string[];
  issues: string[];
}

export interface CrawlError {
  url: string;
  error: string;
  statusCode?: number;
}

// Prompt Templates
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  isDefault: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface URLInputFormData {
  url: string;
  analysisType: AnalysisType;
  customPrompt?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Chart Data Types for Visualizations
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  issues: number;
  color: string;
}

// Export/Report Types
export interface ReportOptions {
  includeDetails: boolean;
  includeRecommendations: boolean;
  includeMetrics: boolean;
  format: 'pdf' | 'html' | 'json';
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}