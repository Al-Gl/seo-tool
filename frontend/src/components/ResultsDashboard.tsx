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
  Eye,
  Activity,
  FileText,
  Code,
  Accessibility,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectOption } from '@/components/ui/Select';
import { ScoreCircle } from '@/components/charts/ScoreCircle';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { Tooltip } from '@/components/ui/Tooltip';
import { Tabs, TabItem, TabPanel } from '@/components/ui/Tabs';
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
import { processAnalysisData, getScoreWeightingTooltip } from '@/lib/analysisProcessor';

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
  const [activeTab, setActiveTab] = useState('issues');

  // Process the analysis data to generate issues and scores
  const processedData = useMemo(() => processAnalysisData(results), [results]);
  const { issues, categoryScores, issueCounts } = processedData;

  // Extract data safely from the nested results object
  const seoAnalysis = results.seoAnalysis || {};
  const crawlData = results.crawlData || {};
  const content = crawlData.content || {};
  const performance = crawlData.performance || {};
  
  const recommendations = useMemo(() => seoAnalysis.recommendations || [], [seoAnalysis.recommendations]);

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    const categoryMatch = categoryFilter === 'all' || rec.category === categoryFilter;
    return categoryMatch;
  });

  const displayedRecommendations = showAllRecommendations ? filteredRecommendations : filteredRecommendations.slice(0, 5);

  // Create score breakdown for the chart
  const scoreBreakdown: ScoreBreakdown[] = useMemo(() => [
    { category: 'Technical', score: categoryScores.technicalScore, maxScore: 100, issues: issues.filter(i => i.category === 'technical').length, color: '#3b82f6' },
    { category: 'Content', score: categoryScores.contentScore, maxScore: 100, issues: issues.filter(i => i.category === 'content').length, color: '#10b981' },
    { category: 'Performance', score: categoryScores.performanceScore, maxScore: 100, issues: issues.filter(i => i.category === 'performance').length, color: '#f59e0b' },
    { category: 'Accessibility', score: categoryScores.accessibilityScore, maxScore: 100, issues: issues.filter(i => i.category === 'accessibility').length, color: '#ef4444' },
  ], [categoryScores, issues]);

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

  // Create tabs for the detailed breakdown section
  const detailTabs: TabItem[] = [
    {
      id: 'issues',
      label: 'Issues & Recommendations',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="space-y-6">
            {/* Programmatically Generated Issues */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Identified Issues</h3>
              {issues.length > 0 ? (
                <div className="space-y-4">
                  {issues.map((issue) => (
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
                          </div>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Issues Found</h3>
                  <p className="text-gray-500">Great! No critical issues were detected in your analysis.</p>
                </div>
              )}
            </div>

            {/* AI-Generated Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
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
                          <p className="text-sm text-gray-600">{recommendation.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      )
    },
    {
      id: 'onpage',
      label: 'On-Page SEO',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Title Tag</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">{content.title || 'No title found'}</p>
                    <p className="text-xs text-gray-500">{content.title?.length || 0} characters</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Meta Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">{content.description || 'No meta description found'}</p>
                    <p className="text-xs text-gray-500">{content.description?.length || 0} characters</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">H1 Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  {content.headings?.h1 && content.headings.h1.length > 0 ? (
                    <div className="space-y-2">
                      {content.headings.h1.map((h1: string, index: number) => (
                        <p key={index} className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{h1}</p>
                      ))}
                      <p className="text-xs text-gray-500">{content.headings.h1.length} H1 tag(s) found</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No H1 tags found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>
      )
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Activity className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {performance.loadTime ? (performance.loadTime / 1000).toFixed(1) + 's' : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {performance.metrics?.lcp && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Largest Contentful Paint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {(performance.metrics.lcp / 1000).toFixed(1)}s
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {performance.metrics?.cls && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {performance.metrics.cls.toFixed(3)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabPanel>
      )
    },
    {
      id: 'schema',
      label: 'Schema',
      icon: <Code className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="space-y-4">
            {content.schemaMarkup ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Markup Found</h3>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{JSON.stringify(content.schemaMarkup, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Schema Markup Found</h3>
                <p className="text-gray-500 mb-4">
                  Schema markup helps search engines understand your content better.
                </p>
                <Button variant="secondary" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn About Schema
                </Button>
              </div>
            )}
          </div>
        </TabPanel>
      )
    }
  ];

  return (
    <div className="space-y-8">
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

      {/* Section A: Top-Level Overview (4-Card Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score Card */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center space-x-2">
              <ScoreCircle 
                score={categoryScores.overallScore} 
                size="xl"
                showLabel={true}
              />
              <Tooltip content={getScoreWeightingTooltip()}>
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-sm text-gray-500 mt-2">Overall Score</p>
          </CardContent>
        </Card>

        {/* Issues Found Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Issues Found</h3>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Critical</span>
                <span className="text-sm font-semibold text-red-600">
                  {issueCounts.critical}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warning</span>
                <span className="text-sm font-semibold text-orange-600">
                  {issueCounts.warning}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Suggestion</span>
                <span className="text-sm font-semibold text-blue-600">
                  {issueCounts.suggestion}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Performance</h3>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Load Time</span>
                <span className="text-sm font-semibold text-gray-900">
                  {performance.loadTime ? (performance.loadTime / 1000).toFixed(1) + 's' : 'N/A'}
                </span>
              </div>
              {performance.metrics?.lcp && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LCP</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {(performance.metrics.lcp / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
              {performance.metrics?.cls && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CLS</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {performance.metrics.cls.toFixed(3)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Crawl Data Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Crawl Data</h3>
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Word Count</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(content.wordCount || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Links</span>
                <span className="text-sm font-semibold text-gray-900">
                  {content.links?.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Images</span>
                <span className="text-sm font-semibold text-gray-900">
                  {content.images?.length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section B: AI Analysis Summary (Visually Distinct) */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-900">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            PulsarRank AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {seoAnalysis.summary || 'AI analysis is processing your website data to provide comprehensive insights and recommendations.'}
          </p>
        </CardContent>
      </Card>

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

      {/* Section C: Detailed Breakdown (Tabbed Interface) */}
      <Card>
        <CardContent className="p-0">
          <Tabs
            tabs={detailTabs}
            defaultTab="issues"
            className="w-full"
            tabsClassName="px-6 pt-6"
            contentClassName="px-6 pb-6"
            onChange={setActiveTab}
          />
        </CardContent>
      </Card>
    </div>
  );
}