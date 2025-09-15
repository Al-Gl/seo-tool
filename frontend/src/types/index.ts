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
  analysisType?: AnalysisType;
  customPrompt?: string;
  progress?: number;
  estimatedTimeRemaining?: number;
  results?: AnalysisResults;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  // Backend response structure
  seoAnalysis?: {
    scores?: { overall?: number };
    summary?: string;
    recommendations?: BeginnerRecommendation[];
    comprehensiveAnalysis?: BeginnerAnalysisResult;
  };
  crawlData?: {
    content?: {
      title?: string;
      description?: string;
      headings?: { h1?: string[] };
      images?: any[];
      wordCount?: number;
      links?: { total?: number };
      schemaMarkup?: any;
    };
    performance?: {
      loadTime?: number;
      metrics?: {
        lcp?: number;
        cls?: number;
      };
    };
    language?: LanguageContext;
  };
}

// New Beginner-Friendly Analysis Types
export interface BeginnerAnalysisResult {
  quickWins: {
    description: string;
    actions: QuickWinAction[];
  };
  importantFixes: {
    description: string;
    actions: ImportantFixAction[];
  };
  advancedOptimizations: {
    description: string;
    actions: AdvancedAction[];
  };
  languageSpecific: {
    detectedLanguage: string;
    recommendations: LanguageSpecificAction[];
  };
}

export interface QuickWinAction {
  task: string;
  whyItMatters: string;
  howToDo: string;
  difficulty: 'beginner';
  timeNeeded: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ImportantFixAction {
  task: string;
  whyItMatters: string;
  howToDo: string;
  difficulty: 'intermediate';
  timeNeeded: string;
  impact: 'high' | 'medium' | 'low';
  codeExample?: string;
}

export interface AdvancedAction {
  task: string;
  whyItMatters: string;
  howToDo: string;
  difficulty: 'advanced';
  timeNeeded: string;
  impact: 'high' | 'medium' | 'low';
  technicalDetails: string;
}

export interface LanguageSpecificAction {
  task: string;
  localContext: string;
  implementation: string;
}

export interface BeginnerRecommendation {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: 'high' | 'medium' | 'low';
  category: SEOCategory;
  title: string;
  whyItMatters: string;
  beginnerGuide: {
    whatToDo: string;
    whereToFind: string;
    timeNeeded: string;
    helpfulTips: string;
  };
  technicalDetails: {
    code?: string;
    implementation: string;
    testingSteps: string;
  };
  expectedOutcome: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface LanguageContext {
  detected: string;
  confidence: number;
  sources: string[];
  culturalContext: {
    titleLength: { min: number; max: number; unit: string };
    metaDescLength: { min: number; max: number; unit: string };
    searchEngines: string[];
    culturalNotes: string;
  };
}

export type AnalysisStatus = 'pending' | 'processing' | 'crawling' | 'analyzing' | 'completed' | 'failed' | 'cancelled';

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