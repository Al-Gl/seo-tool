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
  ScoreBreakdown,
  BeginnerAnalysisResult,
  BeginnerRecommendation,
  QuickWinAction,
  ImportantFixAction,
  AdvancedAction
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
import { BeginnerRecommendationCard, LegacyRecommendationCard } from './RecommendationCards';

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
  { value: 'accessibility', label: 'Accessibility' }
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

  // Safely process the analysis data to generate issues and scores
  const processedData = useMemo(() => {
    if (!results) return { issues: [], categoryScores: {}, issueCounts: { critical: 0, warning: 0, suggestion: 0 } };
    return processAnalysisData(results);
  }, [results]);
  const { issues, categoryScores, issueCounts } = processedData;

  // Safely extract data from the nested results object with fallbacks
  const seoAnalysis = results.seoAnalysis || {};
  const crawlData = results.crawlData || {};
  const content = crawlData.content || {};
  const performance = crawlData.performance || {};
  const headings = content.headings || {};
  
  const recommendations = useMemo(() => seoAnalysis.recommendations || [], [seoAnalysis.recommendations]);

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (!rec) return false;
    const categoryMatch = categoryFilter === 'all' || rec.category === categoryFilter;
    return categoryMatch;
  });

  const displayedRecommendations = showAllRecommendations ? filteredRecommendations : filteredRecommendations.slice(0, 5);

  const scoreBreakdown: ScoreBreakdown[] = useMemo(() => [
    { category: 'Technical', score: categoryScores.technicalScore || 0, maxScore: 100, issues: issues.filter(i => i.category === 'technical').length, color: '#3b82f6' },
    { category: 'Content', score: categoryScores.contentScore || 0, maxScore: 100, issues: issues.filter(i => i.category === 'content').length, color: '#10b981' },
    { category: 'Performance', score: categoryScores.performanceScore || 0, maxScore: 100, issues: issues.filter(i => i.category === 'performance').length, color: '#f59e0b' },
    { category: 'Accessibility', score: categoryScores.accessibilityScore || 0, maxScore: 100, issues: issues.filter(i => i.category === 'accessibility').length, color: '#ef4444' },
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

  // Get beginner-friendly analysis if available
  const beginnerAnalysis = seoAnalysis.comprehensiveAnalysis as BeginnerAnalysisResult;
  const beginnerRecommendations = seoAnalysis.recommendations as BeginnerRecommendation[];

  // Utility function to detect recommendation format
  const isBeginnerRecommendation = (rec: any): rec is BeginnerRecommendation => {
    return rec && rec.difficulty && rec.whyItMatters && rec.beginnerGuide;
  };

  const isLegacyRecommendation = (rec: any) => {
    return rec && rec.title && (rec.description || rec.implementation);
  };

  const detailTabs: TabItem[] = [
    // New beginner-friendly tab first
    ...(beginnerAnalysis ? [{
      id: 'action-plan',
      label: 'Action Plan',
      icon: <CheckCircle className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="space-y-8">
            {/* Language Detection Info */}
            {beginnerAnalysis.languageSpecific && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Website Language Detected</h3>
                </div>
                <p className="text-blue-800 text-sm">
                  This website appears to be in <strong>{beginnerAnalysis.languageSpecific.detectedLanguage.toUpperCase()}</strong>.
                  All recommendations below are tailored for this language.
                </p>
              </div>
            )}

            {/* Quick Wins Section */}
            {beginnerAnalysis.quickWins && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">✅ Quick Wins</h3>
                    <p className="text-gray-600">{beginnerAnalysis.quickWins.description}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {beginnerAnalysis.quickWins.actions.map((action, index) => (
                    <QuickWinCard key={index} action={action} />
                  ))}
                </div>
              </div>
            )}

            {/* Important Fixes Section */}
            {beginnerAnalysis.importantFixes && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">⚠️ Important Fixes</h3>
                    <p className="text-gray-600">{beginnerAnalysis.importantFixes.description}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {beginnerAnalysis.importantFixes.actions.map((action, index) => (
                    <ImportantFixCard key={index} action={action} />
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Optimizations Section */}
            {beginnerAnalysis.advancedOptimizations && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Code className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">🔧 Advanced Optimizations</h3>
                    <p className="text-gray-600">{beginnerAnalysis.advancedOptimizations.description}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {beginnerAnalysis.advancedOptimizations.actions.map((action, index) => (
                    <AdvancedActionCard key={index} action={action} />
                  ))}
                </div>
              </div>
            )}

            {/* Language Specific Recommendations */}
            {beginnerAnalysis.languageSpecific?.recommendations && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">🌍 Language-Specific Tips</h3>
                    <p className="text-gray-600">Recommendations tailored for your website's language</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {beginnerAnalysis.languageSpecific.recommendations.map((rec, index) => (
                    <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold text-blue-900 mb-2">{rec.task}</h4>
                      <p className="text-blue-800 text-sm mb-2">{rec.localContext}</p>
                      <p className="text-blue-700 text-sm">{rec.implementation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      )
    }] : []),
    {
      id: 'issues',
      label: 'Technical Details',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="space-y-6">
            {/* AI-Generated Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                <div className="space-y-4">
                  {displayedRecommendations.map((recommendation, index) => {
                    if (!recommendation) return null;

                    // Render based on recommendation format
                    if (isBeginnerRecommendation(recommendation)) {
                      return <BeginnerRecommendationCard key={index} recommendation={recommendation} />;
                    } else if (isLegacyRecommendation(recommendation)) {
                      return <LegacyRecommendationCard key={index} recommendation={recommendation} />;
                    } else {
                      // Fallback for malformed data
                      return (
                        <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h4 className="font-medium text-red-900">Data Format Issue</h4>
                          </div>
                          <p className="text-red-800 text-sm">
                            This recommendation couldn't be displayed properly. Raw data:
                          </p>
                          <pre className="mt-2 bg-white border border-red-200 rounded p-2 text-xs overflow-x-auto">
                            {JSON.stringify(recommendation, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                  })}
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
                  {headings.h1 && headings.h1.length > 0 ? (
                    <div className="space-y-2">
                      {/* --- THIS IS THE FIX --- */}
                      {headings.h1.map((h1, index) => (
                        <p key={`h1-${index}`} className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{h1.text}</p>
                      ))}
                      <p className="text-xs text-gray-500">{headings.h1.length} H1 tag(s) found</p>
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
            {/* Add more performance cards here if data is available */}
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
            {content.schemaMarkup && content.schemaMarkup.length > 0 ? (
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

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center space-x-2">
              <ScoreCircle 
                score={categoryScores.overallScore || 0} 
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Issues Found</h3>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Critical</span>
                <span className="text-sm font-semibold text-red-600">{issueCounts.critical}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warning</span>
                <span className="text-sm font-semibold text-orange-600">{issueCounts.warning}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Suggestion</span>
                <span className="text-sm font-semibold text-blue-600">{issueCounts.suggestion}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Simplified Performance & Crawl Cards */}
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
            </div>
          </CardContent>
        </Card>
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
                  {formatNumber(content.content?.wordCount || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
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
            {seoAnalysis.summary || 'AI analysis summary is being generated.'}
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

      {/* Detailed Breakdown Tabs */}
      <Card>
        <CardContent className="p-0 sm:p-2">
          <Tabs
            tabs={detailTabs}
            defaultTab="issues"
            className="w-full"
            tabsClassName="px-2 sm:px-6 pt-2 sm:pt-6"
            contentClassName="px-4 py-6 sm:px-6 sm:pb-6"
            onChange={setActiveTab}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components for beginner-friendly cards
function QuickWinCard({ action }: { action: QuickWinAction }) {
  return (
    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
      <div className="flex items-start space-x-3">
        <div className="bg-green-600 text-white rounded-full p-1 mt-1">
          <CheckCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-green-900 mb-2">{action.task}</h4>
          <p className="text-green-800 text-sm mb-3">{action.whyItMatters}</p>
          <div className="bg-white border border-green-200 rounded-md p-3 mb-3">
            <h5 className="font-medium text-green-900 mb-1">How to do this:</h5>
            <p className="text-green-800 text-sm">{action.howToDo}</p>
          </div>
          <div className="flex items-center space-x-4 text-xs text-green-700">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {action.timeNeeded}
            </span>
            <span className={`px-2 py-1 rounded-full ${
              action.impact === 'high' ? 'bg-red-100 text-red-800' :
              action.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {action.impact} impact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportantFixCard({ action }: { action: ImportantFixAction }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
      <div className="flex items-start space-x-3">
        <div className="bg-orange-600 text-white rounded-full p-1 mt-1">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-orange-900 mb-2">{action.task}</h4>
          <p className="text-orange-800 text-sm mb-3">{action.whyItMatters}</p>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-orange-700 hover:text-orange-900 text-sm font-medium mb-3 flex items-center"
          >
            {showDetails ? 'Hide Details' : 'Show How to Fix'}
            <Eye className="w-4 h-4 ml-1" />
          </button>

          {showDetails && (
            <div className="bg-white border border-orange-200 rounded-md p-3 mb-3">
              <h5 className="font-medium text-orange-900 mb-2">Implementation Steps:</h5>
              <p className="text-orange-800 text-sm mb-3">{action.howToDo}</p>
              {action.codeExample && (
                <div>
                  <h6 className="font-medium text-orange-900 mb-1">Code Example:</h6>
                  <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs overflow-x-auto">
                    <code>{action.codeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs text-orange-700">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {action.timeNeeded}
            </span>
            <span className={`px-2 py-1 rounded-full ${
              action.impact === 'high' ? 'bg-red-100 text-red-800' :
              action.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {action.impact} impact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvancedActionCard({ action }: { action: AdvancedAction }) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
      <div className="flex items-start space-x-3">
        <div className="bg-purple-600 text-white rounded-full p-1 mt-1">
          <Code className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-purple-900">{action.task}</h4>
            <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
              Advanced
            </span>
          </div>
          <p className="text-purple-800 text-sm mb-3">{action.whyItMatters}</p>

          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-purple-700 hover:text-purple-900 text-sm font-medium mb-3 flex items-center"
          >
            {showTechnical ? 'Hide Technical Details' : 'Show Technical Details'}
            <Code className="w-4 h-4 ml-1" />
          </button>

          {showTechnical && (
            <div className="bg-white border border-purple-200 rounded-md p-3 mb-3">
              <h5 className="font-medium text-purple-900 mb-2">Implementation:</h5>
              <p className="text-purple-800 text-sm mb-3">{action.howToDo}</p>
              <div>
                <h6 className="font-medium text-purple-900 mb-1">Technical Details:</h6>
                <p className="text-purple-700 text-sm">{action.technicalDetails}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 text-xs text-purple-700">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {action.timeNeeded}
            </span>
            <span className={`px-2 py-1 rounded-full ${
              action.impact === 'high' ? 'bg-red-100 text-red-800' :
              action.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {action.impact} impact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}