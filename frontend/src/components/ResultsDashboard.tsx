import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Globe,
  FileText,
  Filter,
  ExternalLink,
  Zap,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectOption } from '@/components/ui/Select';
import { ScoreCircle } from '@/components/charts/ScoreCircle';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { 
  AnalysisResults, 
  SEOIssue, 
  Recommendation, 
  ScoreBreakdown,
  SEOCategory 
} from '@/types';
import { 
  getSeverityColor, 
  getPriorityColor, 
  formatRelativeTime, 
  formatNumber,
  extractDomain,
  truncateText,
  capitalize
} from '@/lib/utils';
import { reportApi } from '@/lib/api';

interface ResultsDashboardProps {
  results: AnalysisResults;
  analysisId: string;
  analysisUrl: string;
  isGeneratingPdf?: boolean;
  onShareResults?: () => void;
}

const filterOptions: SelectOption[] = [
  { value: 'all', label: 'All Issues' },
  { value: 'critical', label: 'Critical Issues' },
  { value: 'warning', label: 'Warnings' },
  { value: 'suggestion', label: 'Suggestions' },
];

const categoryFilterOptions: SelectOption[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'technical', label: 'Technical' },
  { value: 'content', label: 'Content' },
  { value: 'performance', label: 'Performance' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'structure', label: 'Structure' },
];

export function ResultsDashboard({
  results,
  analysisId,
  analysisUrl,
  isGeneratingPdf = false,
  onShareResults
}: ResultsDashboardProps) {
  const [issueFilter, setIssueFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAllIssues, setShowAllIssues] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  // Filter issues and recommendations
  const filteredIssues = results.issues.filter(issue => {
    const severityMatch = issueFilter === 'all' || issue.severity === issueFilter;
    const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter;
    return severityMatch && categoryMatch;
  });

  const filteredRecommendations = results.recommendations.filter(rec => {
    const categoryMatch = categoryFilter === 'all' || rec.category === categoryFilter;
    return categoryMatch;
  });

  // Get issues and recommendations to display
  const displayedIssues = showAllIssues ? filteredIssues : filteredIssues.slice(0, 5);
  const displayedRecommendations = showAllRecommendations ? filteredRecommendations : filteredRecommendations.slice(0, 3);

  // Create score breakdown for chart
  const scoreBreakdown: ScoreBreakdown[] = [
    {
      category: 'Technical',
      score: Math.max(0, 100 - results.issues.filter(i => i.category === 'technical').length * 10),
      maxScore: 100,
      issues: results.issues.filter(i => i.category === 'technical').length,
      color: '#3b82f6'
    },
    {
      category: 'Content',
      score: Math.max(0, 100 - results.issues.filter(i => i.category === 'content').length * 8),
      maxScore: 100,
      issues: results.issues.filter(i => i.category === 'content').length,
      color: '#10b981'
    },
    {
      category: 'Performance',
      score: Math.max(0, results.metrics.performance.loadTime > 3 ? 60 : 90),
      maxScore: 100,
      issues: results.issues.filter(i => i.category === 'performance').length,
      color: '#f59e0b'
    },
    {
      category: 'Mobile',
      score: Math.max(0, 100 - results.issues.filter(i => i.category === 'mobile').length * 12),
      maxScore: 100,
      issues: results.issues.filter(i => i.category === 'mobile').length,
      color: '#8b5cf6'
    }
  ];

  // Issue counts by severity
  const issueCounts = {
    critical: results.issues.filter(i => i.severity === 'critical').length,
    warning: results.issues.filter(i => i.severity === 'warning').length,
    suggestion: results.issues.filter(i => i.severity === 'suggestion').length,
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await reportApi.generatePdf(analysisId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-analysis-${extractDomain(analysisUrl)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Analysis Results</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <Globe className="w-4 h-4" />
            <span>{extractDomain(analysisUrl)}</span>
            <span>•</span>
            <Clock className="w-4 h-4" />
            <span>{formatRelativeTime(results.generatedAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onShareResults}
            className="flex items-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={handleDownloadPdf}
            loading={isGeneratingPdf}
            size="sm"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <ScoreCircle 
              score={results.overallScore} 
              size="xl"
              showLabel={true}
            />
          </CardContent>
        </Card>

        {/* Issues Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Issues Found</h3>
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Critical</span>
                <span className="text-sm font-semibold text-danger-600">
                  {issueCounts.critical}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warnings</span>
                <span className="text-sm font-semibold text-warning-600">
                  {issueCounts.warning}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Suggestions</span>
                <span className="text-sm font-semibold text-primary-600">
                  {issueCounts.suggestion}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Performance</h3>
              <Zap className="w-5 h-5 text-primary-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Load Time</span>
                <span className="text-sm font-semibold text-gray-900">
                  {results.metrics.performance.loadTime.toFixed(1)}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FCP</span>
                <span className="text-sm font-semibold text-gray-900">
                  {results.metrics.performance.firstContentfulPaint.toFixed(1)}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">LCP</span>
                <span className="text-sm font-semibold text-gray-900">
                  {results.metrics.performance.largestContentfulPaint.toFixed(1)}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crawl Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Crawl Data</h3>
              <Eye className="w-5 h-5 text-success-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pages Found</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(results.crawlData.pagesFound)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pages Crawled</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(results.crawlData.pagesCrawled)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Crawl Depth</span>
                <span className="text-sm font-semibold text-gray-900">
                  {results.crawlData.crawlDepth}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Score Breakdown by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryChart data={scoreBreakdown} />
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{results.summary}</p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={issueFilter}
          onChange={(e) => setIssueFilter(e.target.value)}
          options={filterOptions}
          placeholder="Filter by severity"
          className="sm:w-48"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categoryFilterOptions}
          placeholder="Filter by category"
          className="sm:w-48"
        />
      </div>

      {/* Issues Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Issues & Problems ({filteredIssues.length})
            </CardTitle>
            {filteredIssues.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllIssues(!showAllIssues)}
              >
                {showAllIssues ? 'Show Less' : `Show All (${filteredIssues.length})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {displayedIssues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Issues Found</h3>
              <p className="text-gray-500">Great! No issues match your current filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedIssues.map((issue) => (
                <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${getSeverityColor(issue.severity)}
                        `}>
                          {capitalize(issue.severity)}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {capitalize(issue.category)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="text-xs font-medium text-blue-900 mb-1">How to Fix:</h5>
                        <p className="text-xs text-blue-800">{issue.howToFix}</p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-xs text-gray-500">Impact</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {issue.impact}/10
                      </div>
                    </div>
                  </div>
                  {issue.affectedPages && issue.affectedPages.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <h5 className="text-xs font-medium text-gray-900 mb-2">
                        Affected Pages ({issue.affectedPages.length}):
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {issue.affectedPages.slice(0, 3).map((page, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center text-xs text-gray-600 bg-gray-100 rounded px-2 py-1"
                          >
                            {truncateText(page, 40)}
                          </span>
                        ))}
                        {issue.affectedPages.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{issue.affectedPages.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recommendations ({filteredRecommendations.length})
            </CardTitle>
            {filteredRecommendations.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              >
                {showAllRecommendations ? 'Show Less' : `Show All (${filteredRecommendations.length})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayedRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${getPriorityColor(recommendation.priority)}
                      `}>
                        {capitalize(recommendation.priority)} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                  </div>
                  <div className="ml-4 text-right text-xs text-gray-500">
                    <div>Impact: {recommendation.estimatedImpact}/10</div>
                    <div>Effort: {recommendation.estimatedEffort}/10</div>
                  </div>
                </div>
                
                {/* Action Items */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="text-xs font-medium text-gray-900 mb-2">Action Items:</h5>
                  <div className="space-y-2">
                    {recommendation.actionItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-2">
                        <input 
                          type="checkbox" 
                          checked={item.completed}
                          readOnly
                          className="mt-0.5 h-3 w-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}