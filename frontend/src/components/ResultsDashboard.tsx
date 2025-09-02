import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Globe,
  Zap,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectOption } from '@/components/ui/Select';
import { ScoreCircle } from '@/components/charts/ScoreCircle';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { 
  AnalysisResponse, 
  SEOCategory,
  ScoreBreakdown
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
  results: AnalysisResponse; // The prop is the full analysis response
  analysisId: string;
  analysisUrl: string;
  isGeneratingPdf?: boolean;
  onShareResults?: () => void;
}

const categoryFilterOptions: SelectOption[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'technical', label: 'Technical' },
  { value: 'content', label: 'Content' },
  { value: 'performance', label: 'Performance' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ux', label: 'User Experience' }
];

export function ResultsDashboard({
  results,
  analysisId,
  analysisUrl,
  isGeneratingPdf = false,
  onShareResults
}: ResultsDashboardProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  // --- FIX: Extract data safely from the nested results object ---
  const seoAnalysis = results.seoAnalysis || {};
  const comprehensiveAnalysis = seoAnalysis.comprehensiveAnalysis || {};
  
  // Combine all issues from different categories into one array
  const allIssues = useMemo(() => {
    if (!comprehensiveAnalysis) return [];
    const issueCategories = ['technicalSEO', 'contentQuality', 'userExperience', 'mobileOptimization', 'performance', 'accessibility'];
    let combinedIssues = [];
    issueCategories.forEach(categoryKey => {
      if (comprehensiveAnalysis[categoryKey] && Array.isArray(comprehensiveAnalysis[categoryKey].issues)) {
        combinedIssues.push(...comprehensiveAnalysis[categoryKey].issues.map((issue, index) => ({
          ...issue,
          id: `${categoryKey}-${index}`, // Create a unique ID
          category: categoryKey.replace('SEO', '').toLowerCase()
        })));
      }
    });
    return combinedIssues;
  }, [comprehensiveAnalysis]);

  const recommendations = useMemo(() => seoAnalysis.recommendations || [], [seoAnalysis.recommendations]);

  // --- FIX: Use the extracted data for filtering ---
  const filteredRecommendations = recommendations.filter(rec => {
    const categoryMatch = categoryFilter === 'all' || rec.category === categoryFilter;
    return categoryMatch;
  });

  const displayedRecommendations = showAllRecommendations ? filteredRecommendations : filteredRecommendations.slice(0, 5);

  const scoreBreakdown: ScoreBreakdown[] = useMemo(() => [
    { category: 'Technical', score: comprehensiveAnalysis.technicalSEO?.score || 0, color: '#3b82f6' },
    { category: 'Content', score: comprehensiveAnalysis.contentQuality?.score || 0, color: '#10b981' },
    { category: 'Performance', score: comprehensiveAnalysis.performance?.score || 0, color: '#f59e0b' },
    { category: 'Mobile', score: comprehensiveAnalysis.mobileOptimization?.score || 0, color: '#8b5cf6' },
    { category: 'Accessibility', score: comprehensiveAnalysis.accessibility?.score || 0, color: '#ef4444' },
    { category: 'UX', score: comprehensiveAnalysis.userExperience?.score || 0, color: '#6366f1' },
  ], [comprehensiveAnalysis]);

  const issueCounts = useMemo(() => ({
    critical: allIssues.filter(i => i.severity === 'critical').length,
    warning: allIssues.filter(i => i.severity === 'warning').length,
    suggestion: allIssues.filter(i => i.severity === 'suggestion').length,
  }), [allIssues]);

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
            <span>{formatRelativeTime(results.completedAt || results.updatedAt)}</span>
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
            disabled={isGeneratingPdf}
            size="sm"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <ScoreCircle 
              score={seoAnalysis.scores?.overall || 0} 
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

        {/* Performance & Crawl Summary Cards */}
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
                  {(results.crawlData?.performance?.loadTime / 1000).toFixed(1) || 'N/A'}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Crawl Data</h3>
              <Eye className="w-5 h-5 text-success-600" />
            </div>
             <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Word Count</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(results.crawlData?.content?.content?.wordCount || 0)}
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
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{seoAnalysis.summary || 'No summary available.'}</p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categoryFilterOptions}
          placeholder="Filter by category"
          className="sm:w-48"
        />
      </div>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recommendations ({filteredRecommendations.length})
            </CardTitle>
            {recommendations.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              >
                {showAllRecommendations ? 'Show Less' : `Show All (${recommendations.length})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {displayedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {displayedRecommendations.map((recommendation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Recommendations Found</h3>
              <p className="text-gray-500">Great! No specific recommendations match your current filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}