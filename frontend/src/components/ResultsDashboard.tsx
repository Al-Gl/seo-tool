import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Share2,
  AlertTriangle,
  AlertCircle,
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
  ExternalLink,
  ArrowRight
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
  capitalize,
  getLanguageName
} from '@/lib/utils';
import { reportApi } from '@/lib/api';
import { processAnalysisData, getScoreWeightingTooltip } from '@/lib/analysisProcessor';
import { BeginnerRecommendationCard, LegacyRecommendationCard } from './RecommendationCards';
import { ModernAIInsights } from './ModernAIInsights';
import { EnhancedIssueCard } from './EnhancedIssueCard';

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

  const handleNavigateToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    // Scroll to the tabs section
    setTimeout(() => {
      const tabsElement = document.getElementById('detailed-tabs');
      if (tabsElement) {
        tabsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const detailTabs: TabItem[] = [
    // Enhanced Issues tab first
    {
      id: 'issues',
      label: 'Issues & Fixes',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detailed Issues Analysis
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{issues.length} issues found</span>
              </div>
            </div>

            {issues.length > 0 ? (
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <EnhancedIssueCard
                    key={issue.id}
                    issue={issue}
                    index={index}
                    onNavigateToSection={handleNavigateToSection}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found!</h3>
                <p className="text-gray-600">Your website is performing well according to our analysis.</p>
              </div>
            )}
          </div>
        </TabPanel>
      )
    },
    // New beginner-friendly tab second
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
      id: 'technical-details',
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
      id: 'crawl-data',
      label: 'SEO Data',
      icon: <Eye className="w-4 h-4" />,
      content: (
        <TabPanel>
          <div className="space-y-8">
            {/* Meta Tags Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Tags & Social Media</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Open Graph */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-900 flex items-center">
                      <div className="bg-blue-100 p-1 rounded mr-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      Open Graph Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {crawlData.openGraph && Object.keys(crawlData.openGraph).length > 0 ? (
                      Object.entries(crawlData.openGraph).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start">
                          <span className="text-xs text-blue-700 font-medium">og:{key}</span>
                          <span className="text-xs text-blue-800 text-right ml-2 max-w-xs truncate" title={value as string}>
                            {value as string}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-xs text-blue-600">No Open Graph tags found</p>
                        <p className="text-xs text-blue-500">Add OG tags for better social sharing</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Twitter Card */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-900 flex items-center">
                      <div className="bg-purple-100 p-1 rounded mr-2">
                        <Share2 className="w-4 h-4 text-purple-600" />
                      </div>
                      Twitter Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {crawlData.twitterCard && Object.keys(crawlData.twitterCard).length > 0 ? (
                      Object.entries(crawlData.twitterCard).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start">
                          <span className="text-xs text-purple-700 font-medium">twitter:{key}</span>
                          <span className="text-xs text-purple-800 text-right ml-2 max-w-xs truncate" title={value as string}>
                            {value as string}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-xs text-purple-600">No Twitter Card tags found</p>
                        <p className="text-xs text-purple-500">Add Twitter meta tags for better sharing</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Technical SEO Indicators */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical SEO Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Canonical URL',
                    status: !!crawlData.canonical,
                    value: crawlData.canonical ? '✓' : '✗',
                    icon: ExternalLink
                  },
                  {
                    label: 'Meta Viewport',
                    status: !!crawlData.hasViewport,
                    value: crawlData.hasViewport ? '✓' : '✗',
                    icon: Globe
                  },
                  {
                    label: 'SSL Certificate',
                    status: analysisUrl.startsWith('https://'),
                    value: analysisUrl.startsWith('https://') ? '✓' : '✗',
                    icon: CheckCircle
                  },
                  {
                    label: 'Favicon',
                    status: !!crawlData.hasFavicon,
                    value: crawlData.hasFavicon ? '✓' : '✗',
                    icon: Eye
                  },
                ].map((item, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${item.status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <item.icon className={`w-4 h-4 ${item.status ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-lg font-bold ${item.status ? 'text-green-600' : 'text-red-600'}`}>
                        {item.value}
                      </span>
                    </div>
                    <p className={`text-xs ${item.status ? 'text-green-700' : 'text-red-700'}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Images Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Images SEO Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-gray-600" />
                      Total Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold text-gray-900">
                      {content.images?.length || 0}
                    </span>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                      Missing Alt Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold text-orange-600">
                      {content.images?.filter((img: any) => !img.alt || img.alt.trim() === '').length || 0}
                    </span>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Alt Text Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold text-green-600">
                      {content.images?.length > 0
                        ? Math.round(((content.images.filter((img: any) => img.alt && img.alt.trim() !== '').length / content.images.length) * 100))
                        : 0}%
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Links Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Internal Links',
                    value: content.links?.internal || 0,
                    color: 'blue',
                    icon: ArrowRight
                  },
                  {
                    label: 'External Links',
                    value: content.links?.external || 0,
                    color: 'green',
                    icon: ExternalLink
                  },
                  {
                    label: 'Total Links',
                    value: (content.links?.internal || 0) + (content.links?.external || 0),
                    color: 'purple',
                    icon: Globe
                  },
                  {
                    label: 'Link Ratio',
                    value: content.links?.internal && content.links?.external
                      ? `${Math.round((content.links.internal / (content.links.internal + content.links.external)) * 100)}% int`
                      : 'N/A',
                    color: 'orange',
                    icon: BarChart3
                  },
                ].map((item, index) => (
                  <Card key={index} className={`bg-${item.color}-50 border-${item.color}-200`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                        <span className={`text-xl font-bold text-${item.color}-600`}>
                          {item.value}
                        </span>
                      </div>
                      <p className={`text-xs text-${item.color}-700`}>{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Content Quality Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Quality</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="text-xl font-bold text-indigo-600">
                        {formatNumber(content.wordCount || 0)}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700">Word Count</p>
                  </CardContent>
                </Card>

                <Card className="bg-teal-50 border-teal-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Code className="w-5 h-5 text-teal-600" />
                      <span className="text-xl font-bold text-teal-600">
                        {headings.h1?.length || 0}
                      </span>
                    </div>
                    <p className="text-xs text-teal-700">H1 Tags</p>
                  </CardContent>
                </Card>

                <Card className="bg-pink-50 border-pink-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Accessibility className="w-5 h-5 text-pink-600" />
                      <span className="text-xl font-bold text-pink-600">
                        {content.title?.length || 0}
                      </span>
                    </div>
                    <p className="text-xs text-pink-700">Title Length</p>
                  </CardContent>
                </Card>

                <Card className="bg-cyan-50 border-cyan-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-cyan-600" />
                      <span className="text-xl font-bold text-cyan-600">
                        {content.description?.length || 0}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-700">Meta Desc Length</p>
                  </CardContent>
                </Card>
              </div>
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
          <div className="space-y-8">
            {/* Performance Overview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Overall Performance Score */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-8 h-8 text-blue-600" />
                      <div className="text-right">
                        <span className="text-3xl font-bold text-blue-600">
                          {performance.scores?.performance || 'N/A'}
                        </span>
                        {performance.scores?.performance && <span className="text-blue-500 text-lg">/100</span>}
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 font-medium">Overall Performance</p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${performance.scores?.performance || 0}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Load Time */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-8 h-8 text-green-600" />
                      <div className="text-right">
                        <span className="text-3xl font-bold text-green-600">
                          {performance.loadTime ? (performance.loadTime / 1000).toFixed(1) : 'N/A'}
                        </span>
                        {performance.loadTime && <span className="text-green-500 text-lg">s</span>}
                      </div>
                    </div>
                    <p className="text-sm text-green-700 font-medium">Load Time</p>
                    <p className="text-xs text-green-600 mt-1">
                      {performance.loadTime <= 2500 ? 'Excellent' :
                       performance.loadTime <= 4000 ? 'Good' :
                       performance.loadTime <= 5000 ? 'Fair' : 'Needs Improvement'}
                    </p>
                  </CardContent>
                </Card>

                {/* Core Web Vitals Placeholder */}
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                      <div className="text-right">
                        <span className="text-2xl font-bold text-orange-600">
                          {Object.keys(performance.coreWebVitals || {}).length}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-orange-700 font-medium">Core Web Vitals</p>
                    <p className="text-xs text-orange-600 mt-1">Metrics Available</p>
                  </CardContent>
                </Card>

                {/* Resource Count */}
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                      <div className="text-right">
                        <span className="text-3xl font-bold text-purple-600">
                          {performance.resources?.requests || 0}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-purple-700 font-medium">Total Requests</p>
                    <p className="text-xs text-purple-600 mt-1">
                      {performance.resources?.errors || 0} errors
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Core Web Vitals Detail */}
            {performance.coreWebVitals && Object.keys(performance.coreWebVitals).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LCP - Largest Contentful Paint */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-900 flex items-center justify-between">
                        <span>Largest Contentful Paint</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          performance.coreWebVitals.lcp <= 2500 ? 'bg-green-100 text-green-800' :
                          performance.coreWebVitals.lcp <= 4000 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {performance.coreWebVitals.lcp <= 2500 ? 'Good' :
                           performance.coreWebVitals.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {performance.coreWebVitals.lcp ? `${(performance.coreWebVitals.lcp / 1000).toFixed(1)}s` : 'N/A'}
                      </div>
                      <p className="text-xs text-blue-700">
                        Time until largest element is rendered. Target: &lt;2.5s
                      </p>
                    </CardContent>
                  </Card>

                  {/* FID - First Input Delay */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-900 flex items-center justify-between">
                        <span>First Input Delay</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          performance.coreWebVitals.fid <= 100 ? 'bg-green-100 text-green-800' :
                          performance.coreWebVitals.fid <= 300 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {performance.coreWebVitals.fid <= 100 ? 'Good' :
                           performance.coreWebVitals.fid <= 300 ? 'Needs Improvement' : 'Poor'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {performance.coreWebVitals.fid !== null ? `${performance.coreWebVitals.fid}ms` : 'N/A'}
                      </div>
                      <p className="text-xs text-green-700">
                        Time to interact after first click/tap. Target: &lt;100ms
                      </p>
                    </CardContent>
                  </Card>

                  {/* CLS - Cumulative Layout Shift */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-orange-900 flex items-center justify-between">
                        <span>Cumulative Layout Shift</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          performance.coreWebVitals.cls <= 0.1 ? 'bg-green-100 text-green-800' :
                          performance.coreWebVitals.cls <= 0.25 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {performance.coreWebVitals.cls <= 0.1 ? 'Good' :
                           performance.coreWebVitals.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {performance.coreWebVitals.cls !== null ? performance.coreWebVitals.cls.toFixed(3) : 'N/A'}
                      </div>
                      <p className="text-xs text-orange-700">
                        Visual stability of page. Target: &lt;0.1
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Additional Performance Metrics */}
            {(performance.coreWebVitals?.fcp || performance.coreWebVitals?.ttfb) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Contentful Paint */}
                  {performance.coreWebVitals.fcp && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">First Contentful Paint</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-gray-800 mb-1">
                          {(performance.coreWebVitals.fcp / 1000).toFixed(1)}s
                        </div>
                        <p className="text-xs text-gray-600">
                          Time until first content is painted. Target: &lt;1.8s
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Time to First Byte */}
                  {performance.coreWebVitals.ttfb && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Time to First Byte</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-gray-800 mb-1">
                          {performance.coreWebVitals.ttfb}ms
                        </div>
                        <p className="text-xs text-gray-600">
                          Server response time. Target: &lt;600ms
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Performance Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Recommendations</h3>
              <div className="space-y-3">
                {performance.loadTime > 3000 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-red-900">Slow Load Time Detected</h4>
                    </div>
                    <p className="text-red-800 text-sm">
                      Your page takes {(performance.loadTime / 1000).toFixed(1)} seconds to load.
                      Consider optimizing images, enabling compression, and reducing JavaScript execution time.
                    </p>
                  </div>
                )}

                {performance.coreWebVitals?.lcp > 2500 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900">Large Contentful Paint Needs Improvement</h4>
                    </div>
                    <p className="text-yellow-800 text-sm">
                      Optimize your largest content element loading time. Consider image optimization,
                      preloading critical resources, and improving server response times.
                    </p>
                  </div>
                )}

                {performance.coreWebVitals?.cls > 0.1 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium text-orange-900">Layout Stability Issues</h4>
                    </div>
                    <p className="text-orange-800 text-sm">
                      Your page has layout shifts that affect user experience.
                      Add size attributes to images and ensure proper spacing for dynamic content.
                    </p>
                  </div>
                )}
              </div>
            </div>
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
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                  <code className="text-gray-900 leading-relaxed">{JSON.stringify(content.schemaMarkup, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Schema Markup Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                  Consider adding JSON-LD schema markup to improve search visibility and help search engines better understand your content.
                </p>
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200 max-w-md mx-auto">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Schema markup can improve click-through rates by enabling rich snippets in search results.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with prominent URL */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SEO Analysis Results</h1>
            <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Analyzing URL:</span>
              </div>
              <div className="font-mono text-lg font-semibold text-blue-800 break-all">
                {analysisUrl}
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>Domain:</span>
                  <span className="font-medium">{extractDomain(analysisUrl)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Analyzed {formatRelativeTime(results.completedAt || results.updatedAt)}</span>
                </span>
                {/* Language indicator */}
                {crawlData?.language?.detected && crawlData.language.detected !== 'en' && (
                  <span className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                    <Globe className="w-3 h-3" />
                    <span>Language: {getLanguageName(crawlData.language.detected)}</span>
                    {crawlData.encoding?.hasSpecialChars && (
                      <span className="text-xs">• Special chars: ø, æ, å</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="ml-6 flex space-x-2">
            <Button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </Button>
            {onShareResults && (
              <Button variant="outline" onClick={onShareResults} className="flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            )}
          </div>
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
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-orange-200 bg-gradient-to-br from-orange-50 to-red-50"
          onClick={() => setActiveTab('issues')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-orange-900">Issues Found</h3>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Critical</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-red-600">{issueCounts.critical}</span>
                  {issueCounts.critical > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warning</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-orange-600">{issueCounts.warning}</span>
                  {issueCounts.warning > 0 && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Suggestion</span>
                <span className="text-sm font-semibold text-blue-600">{issueCounts.suggestion}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-orange-700">Click to view detailed fixes</span>
                <ExternalLink className="w-3 h-3 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Enhanced Performance Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50"
          onClick={() => setActiveTab('performance')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-yellow-900">Performance</h3>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Score</span>
                <span className="text-sm font-semibold text-yellow-900">
                  {performance.scores?.performance ? `${performance.scores.performance}/100` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Load Time</span>
                <span className="text-sm font-semibold text-yellow-900">
                  {performance.loadTime ? (performance.loadTime / 1000).toFixed(1) + 's' : 'N/A'}
                </span>
              </div>
              {performance.coreWebVitals?.lcp && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LCP</span>
                  <span className={`text-sm font-semibold ${
                    performance.coreWebVitals.lcp <= 2500 ? 'text-green-600' :
                    performance.coreWebVitals.lcp <= 4000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(performance.coreWebVitals.lcp / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
              {performance.coreWebVitals?.cls && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CLS</span>
                  <span className={`text-sm font-semibold ${
                    performance.coreWebVitals.cls <= 0.1 ? 'text-green-600' :
                    performance.coreWebVitals.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {performance.coreWebVitals.cls?.toFixed(3)}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-700">View Core Web Vitals details</span>
                <ExternalLink className="w-3 h-3 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
         <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
          onClick={() => setActiveTab('crawl-data')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-green-900">Crawl Data</h3>
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
                <span className="text-sm text-gray-600">Images</span>
                <span className="text-sm font-semibold text-gray-900">
                  {content.images?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Links</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(content.links?.internal || 0) + (content.links?.external || 0)}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-700">View detailed SEO analysis</span>
                <ExternalLink className="w-3 h-3 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern AI Insights */}
      <ModernAIInsights
        insights={{
          summary: seoAnalysis.summary || 'AI analysis summary is being generated.',
          concreteOptimizations: generateMockOptimizations(content, crawlData),
          searchIntent: generateMockSearchIntent(content),
          quickWins: generateQuickWins(content, crawlData),
          priorityActions: generatePriorityActions(issues)
        }}
        currentTitle={content.title}
        currentMetaDescription={content.description}
        url={analysisUrl}
      />

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
      <Card id="detailed-tabs">
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

// Helper functions to generate enhanced AI insights data
function generateMockOptimizations(content: any, crawlData: any) {
  const optimizations = [];

  // Title optimization
  if (content.title) {
    const titleLength = content.title.length;
    if (titleLength > 60 || titleLength < 30) {
      optimizations.push({
        type: 'title' as const,
        title: 'Optimize Title Tag Length',
        current: content.title,
        optimized: titleLength > 60
          ? content.title.substring(0, 57) + '...'
          : content.title + ' - Professional Services & Solutions',
        reason: titleLength > 60
          ? 'Title is too long and will be truncated in search results'
          : 'Title is too short and missing valuable keywords',
        impact: 'high' as const,
        difficulty: 'easy' as const,
        estimatedTime: '2 minutes',
        keywordsTargeted: ['main keyword', 'secondary keyword']
      });
    }
  }

  // Meta description optimization
  if (!content.description || content.description.length < 120 || content.description.length > 160) {
    optimizations.push({
      type: 'meta-description' as const,
      title: 'Create Compelling Meta Description',
      current: content.description || 'No meta description',
      optimized: 'Discover professional services and solutions that drive results. Expert consultation, proven strategies, and dedicated support for your business success.',
      reason: !content.description
        ? 'Missing meta description reduces click-through rates from search results'
        : 'Meta description length should be 120-160 characters for optimal display',
      impact: 'high' as const,
      difficulty: 'easy' as const,
      estimatedTime: '5 minutes',
      keywordsTargeted: ['professional services', 'solutions', 'business success']
    });
  }

  return optimizations.slice(0, 3); // Limit to 3 optimizations for demo
}

function generateMockSearchIntent(content: any) {
  // Analyze the content to determine search intent
  const titleText = content.title?.toLowerCase() || '';
  const hasCommercialTerms = /buy|purchase|price|cost|service|solution/.test(titleText);
  const hasInformationalTerms = /how|what|why|guide|tips|learn/.test(titleText);

  let primaryIntent: 'informational' | 'navigational' | 'commercial' | 'transactional' = 'informational';
  let confidence = 75;

  if (hasCommercialTerms) {
    primaryIntent = 'commercial';
    confidence = 85;
  } else if (hasInformationalTerms) {
    primaryIntent = 'informational';
    confidence = 90;
  }

  return {
    primaryIntent,
    intentConfidence: confidence,
    secondaryIntents: ['navigational'],
    keywordAnalysis: {
      mainKeywords: extractKeywordsFromTitle(content.title || ''),
      longtailOpportunities: ['best professional services', 'affordable business solutions', 'expert consultation services'],
      semanticKeywords: ['professional', 'services', 'business', 'solutions', 'expert'],
      competitorKeywords: ['professional consulting', 'business advisory', 'corporate solutions']
    },
    contentFitScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
    gapAnalysis: [
      'Add more specific service descriptions',
      'Include customer testimonials',
      'Clarify pricing structure'
    ],
    userJourneyStage: hasCommercialTerms ? 'consideration' as const : 'awareness' as const
  };
}

function generateQuickWins(content: any, crawlData: any) {
  const wins = [];

  if (!content.description) {
    wins.push('Add a compelling meta description to improve click-through rates');
  }

  if (content.title && content.title.length > 60) {
    wins.push('Shorten your title tag to under 60 characters');
  }

  // Check for missing alt text (mock check)
  wins.push('Add alt text to images for better accessibility and SEO');

  if (crawlData?.performance?.loadTime > 3000) {
    wins.push('Optimize images to improve page load speed');
  }

  wins.push('Add structured data markup for better search visibility');

  return wins.slice(0, 4); // Limit to 4 quick wins
}

function generatePriorityActions(issues: any[]) {
  return issues.slice(0, 6).map((issue, index) => ({
    action: issue.title || `SEO Issue ${index + 1}`,
    impact: issue.impact || Math.floor(Math.random() * 4) + 7, // 7-10
    effort: Math.floor(Math.random() * 6) + 2, // 2-7
    category: issue.category || 'technical' as const
  }));
}

function extractKeywordsFromTitle(title: string) {
  // Simple keyword extraction from title
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5);
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