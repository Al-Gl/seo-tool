import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Copy,
  ChevronRight,
  BarChart3,
  Users,
  Search,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Brain,
  Wand2,
  List,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConcreteOptimization, AIInsights, ProfessionalAnalysisResult } from '@/types';
import { parseAISummary, ParsedSummarySection } from '@/lib/utils';

interface ModernAIInsightsProps {
  insights: AIInsights;
  currentTitle?: string;
  currentMetaDescription?: string;
  url: string;
  professionalAnalysis?: ProfessionalAnalysisResult;
  seoValidation?: Record<string, any>;
  priorityMatrix?: Record<string, any>[];
}

// Structured Summary Component
function StructuredSummary({ text }: { text: string }) {
  const structuredSummary = parseAISummary(text);

  if (!structuredSummary.hasStructure) {
    // Fallback to original paragraph display
    return (
      <p className="text-white/90 leading-relaxed text-base">
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {structuredSummary.sections.map((section, index) => (
        <SummarySection key={index} section={section} />
      ))}
    </div>
  );
}

// Individual Section Component
function SummarySection({ section }: { section: ParsedSummarySection }) {
  switch (section.type) {
    case 'header':
      const HeaderTag = section.level === 1 ? 'h3' : section.level === 2 ? 'h4' : 'h5';
      const headerSizeClass = section.level === 1 ? 'text-lg font-bold' :
                             section.level === 2 ? 'text-base font-semibold' :
                             'text-sm font-medium';

      return (
        <div className="border-l-4 border-yellow-300 pl-4 py-2">
          <HeaderTag className={`text-yellow-100 ${headerSizeClass} flex items-center space-x-2`}>
            {section.icon && <span className="text-lg">{section.icon}</span>}
            <span>{section.content}</span>
          </HeaderTag>
        </div>
      );

    case 'list':
      return (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <List className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-blue-100">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {section.items?.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-white/90 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'metric':
      return (
        <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-300" />
            <span className="text-blue-100 text-sm font-medium">{section.content}</span>
          </div>
        </div>
      );

    case 'action':
      return (
        <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-400/30">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-orange-300" />
            <span className="text-orange-100 text-sm font-medium">{section.content}</span>
          </div>
        </div>
      );

    case 'paragraph':
    default:
      return (
        <p className="text-white/90 leading-relaxed text-base">
          {section.content}
        </p>
      );
  }
}

export function ModernAIInsights({
  insights,
  currentTitle = "",
  currentMetaDescription = "",
  seoValidation,
  priorityMatrix
}: ModernAIInsightsProps) {
  const [activeOptimization, setActiveOptimization] = useState<string | null>(null);
  const [copiedOptimization, setCopiedOptimization] = useState<string | null>(null);

  const handleCopyOptimization = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOptimization(id);
      setTimeout(() => setCopiedOptimization(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'navigational': return 'bg-green-100 text-green-800 border-green-200';
      case 'commercial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'transactional': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* SEO Validation Dashboard */}
      {seoValidation && (
        <SEOValidationDashboard
          validation={seoValidation}
          priorityMatrix={priorityMatrix}
          currentTitle={currentTitle}
          currentMetaDescription={currentMetaDescription}
        />
      )}

      {/* Hero AI Insights Card */}
      <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border-0 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-36 -translate-x-36"></div>

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center text-2xl font-bold">
            <div className="bg-white/20 p-3 rounded-xl mr-4 backdrop-blur-sm">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span>PulsarRank AI Insights</span>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-lg font-normal text-white/80 mt-1">
                Advanced SEO Intelligence & Optimization Engine
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* AI Summary with modern styling */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-2 mb-4">
              <Wand2 className="w-5 h-5 text-yellow-300" />
              <h3 className="text-lg font-semibold">AI Analysis Summary</h3>
            </div>
            <StructuredSummary text={insights.summary || 'AI analysis summary is being generated.'} />
          </div>

          {/* Quick Wins Section */}
          {insights.quickWins && insights.quickWins.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-300" />
                <h3 className="text-lg font-semibold">⚡ Quick Wins</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.quickWins.map((win, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" />
                      <span className="text-sm text-white/90">{win}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Intent Analysis */}
      {insights.searchIntent && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              Search Intent Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Intent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 font-medium">Primary Intent:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getIntentColor(insights.searchIntent.primaryIntent)}`}>
                  {insights.searchIntent.primaryIntent.charAt(0).toUpperCase() + insights.searchIntent.primaryIntent.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Confidence:</span>
                <span className="font-semibold text-blue-600">{insights.searchIntent.intentConfidence}%</span>
              </div>
            </div>

            {/* Content Fit Score */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Content-Intent Alignment</span>
                <span className="text-2xl font-bold text-blue-600">{insights.searchIntent.contentFitScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${insights.searchIntent.contentFitScore}%` }}
                ></div>
              </div>
            </div>

            {/* Keyword Analysis */}
            {insights.searchIntent.keywordAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Search className="w-4 h-4 mr-2 text-blue-500" />
                    Main Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.searchIntent.keywordAnalysis.mainKeywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                    Opportunities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.searchIntent.keywordAnalysis.longtailOpportunities.slice(0, 5).map((keyword, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Journey Stage */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">User Journey Stage:</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {insights.searchIntent.userJourneyStage.charAt(0).toUpperCase() + insights.searchIntent.userJourneyStage.slice(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concrete Optimizations */}
      {insights.concreteOptimizations && insights.concreteOptimizations.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              Concrete Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.concreteOptimizations.map((optimization, index) => (
              <OptimizationCard
                key={index}
                optimization={optimization}
                isActive={activeOptimization === `opt-${index}`}
                onToggle={() => setActiveOptimization(
                  activeOptimization === `opt-${index}` ? null : `opt-${index}`
                )}
                onCopy={(text) => handleCopyOptimization(text, `opt-${index}`)}
                isCopied={copiedOptimization === `opt-${index}`}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Priority Actions */}
      {insights.priorityActions && insights.priorityActions.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              Priority Actions Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.priorityActions.map((action, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{action.action}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(action.impact > 7 ? 'high' : action.impact > 4 ? 'medium' : 'low')}`}>
                      Impact: {action.impact}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Effort: {action.effort}/10</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {action.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// SEO Validation Dashboard Component
function SEOValidationDashboard({
  validation,
  priorityMatrix
}: {
  validation: Record<string, any>;
  priorityMatrix?: Record<string, any>[];
  currentTitle: string;
  currentMetaDescription: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-5 h-5" />;
    if (score >= 60) return <Clock className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <ArrowRight className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall SEO Score */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <div className="bg-slate-200 p-2 rounded-lg mr-3">
              <BarChart3 className="w-5 h-5 text-slate-600" />
            </div>
            SEO Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-1">
                {validation.overallScore}%
              </div>
              <div className="text-sm text-slate-600">Overall Score</div>
            </div>

            {Object.entries(validation).filter(([, value]) =>
              typeof value === 'object' && value !== null && 'score' in value
            ).map(([area, data]: [string, any]) => (
              <div key={area} className="text-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 ${getScoreColor(data.score)}`}>
                  {getScoreIcon(data.score)}
                </div>
                <div className="text-lg font-semibold text-slate-800">{data.score}%</div>
                <div className="text-xs text-slate-600 capitalize">
                  {area.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Matrix */}
      {priorityMatrix && priorityMatrix.length > 0 && (
        <Card className="border border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              Critical SEO Issues to Fix First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityMatrix.slice(0, 5).map((item: Record<string, any>, idx: number) => (
                <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(item.priority)}
                      <span className="font-semibold text-slate-800 capitalize">
                        {item.area.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.priority} priority
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">Score:</span>
                      <span className={`font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
                        {item.score}%
                      </span>
                    </div>
                  </div>

                  {item.issues && item.issues.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-red-600 mb-2">Issues:</div>
                      <ul className="space-y-1">
                        {item.issues.map((issue: string, issueIdx: number) => (
                          <li key={issueIdx} className="flex items-start space-x-2 text-sm">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0 mt-2"></span>
                            <span className="text-red-700">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.recommendations && item.recommendations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-blue-600 mb-2">Quick Fixes:</div>
                      <ul className="space-y-1">
                        {item.recommendations.slice(0, 2).map((rec: string, recIdx: number) => (
                          <li key={recIdx} className="flex items-start space-x-2 text-sm">
                            <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-blue-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Individual Optimization Card Component
function OptimizationCard({
  optimization,
  isActive,
  onToggle,
  onCopy,
  isCopied
}: {
  optimization: ConcreteOptimization;
  isActive: boolean;
  onToggle: () => void;
  onCopy: (text: string) => void;
  isCopied: boolean;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-green-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-800">{optimization.title}</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getImpactColor(optimization.impact)}`}>
                {optimization.impact} impact
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(optimization.difficulty)}`}>
                {optimization.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{optimization.reason}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {optimization.estimatedTime}
              </span>
              {optimization.keywordsTargeted && optimization.keywordsTargeted.length > 0 && (
                <span>Keywords: {optimization.keywordsTargeted.join(', ')}</span>
              )}
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isActive ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {isActive && (
        <div className="border-t border-green-200 bg-green-25">
          <div className="p-4 space-y-4">
            {/* Current vs Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">Current</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800 font-mono">{optimization.current}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Optimized</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(optimization.optimized);
                    }}
                    className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-700 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800 font-mono">{optimization.optimized}</p>
                </div>
              </div>
            </div>

            {/* Implementation Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-900">How to implement</span>
              </div>
              <p className="text-sm text-blue-800">
                Replace your current {optimization.type.replace('-', ' ')} with the optimized version above.
                This change targets {optimization.keywordsTargeted?.join(', ') || 'key search terms'}
                and should improve your search rankings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}