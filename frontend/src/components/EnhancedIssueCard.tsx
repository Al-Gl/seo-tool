import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Clock,
  TrendingUp,
  Code,
  Eye,
  ArrowRight,
  Target,
  Lightbulb
} from 'lucide-react';
import { ProcessedIssue } from '@/lib/analysisProcessor';

interface EnhancedIssueCardProps {
  issue: ProcessedIssue;
  onNavigateToSection?: (sectionId: string) => void;
  index: number;
}

export function EnhancedIssueCard({ issue, onNavigateToSection, index }: EnhancedIssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarkedAsFixed, setIsMarkedAsFixed] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
        };
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'technical':
        return { icon: Code, label: 'Technical SEO', color: 'bg-purple-100 text-purple-800' };
      case 'content':
        return { icon: Eye, label: 'Content', color: 'bg-green-100 text-green-800' };
      case 'performance':
        return { icon: TrendingUp, label: 'Performance', color: 'bg-yellow-100 text-yellow-800' };
      case 'accessibility':
        return { icon: Target, label: 'Accessibility', color: 'bg-blue-100 text-blue-800' };
      default:
        return { icon: Info, label: category, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getDetailedExplanation = (issue: ProcessedIssue) => {
    // Generate detailed explanations based on issue type
    const explanations: Record<string, any> = {
      'Title Too Long': {
        impact: 'Search engines truncate titles longer than 60 characters, reducing click-through rates',
        solution: 'Rewrite your title to be under 60 characters while keeping the most important keywords',
        codeExample: '<title>Your Optimized Title Here - Brand Name</title>',
        estimatedTime: '5 minutes',
        difficulty: 'Easy',
        resources: [
          { title: 'Google Title Tag Guidelines', url: 'https://developers.google.com/search/docs/appearance/title-link' },
          { title: 'Title Tag Best Practices', url: 'https://moz.com/learn/seo/title-tag' }
        ]
      },
      'Meta Description Length Issue': {
        impact: 'Missing or poorly sized meta descriptions reduce click-through rates from search results',
        solution: 'Create a compelling meta description between 120-160 characters that summarizes your page content',
        codeExample: '<meta name="description" content="Your compelling meta description here, between 120-160 characters, that encourages clicks.">',
        estimatedTime: '10 minutes',
        difficulty: 'Easy',
        resources: [
          { title: 'Meta Description Guide', url: 'https://moz.com/learn/seo/meta-description' }
        ]
      },
      'H1 Tag Issue': {
        impact: 'H1 tags help search engines understand your page structure and main topic',
        solution: 'Ensure every page has exactly one H1 tag that clearly describes the page content',
        codeExample: '<h1>Your Main Page Heading Here</h1>',
        estimatedTime: '3 minutes',
        difficulty: 'Easy',
        resources: [
          { title: 'Heading Tags Best Practices', url: 'https://moz.com/learn/seo/on-page-factors' }
        ]
      },
      'Images Missing Alt Text': {
        impact: 'Missing alt text hurts accessibility and search engines cannot understand your images',
        solution: 'Add descriptive alt text to all images that convey meaning',
        codeExample: '<img src="example.jpg" alt="Descriptive text about the image content">',
        estimatedTime: '15 minutes',
        difficulty: 'Easy',
        resources: [
          { title: 'Image Alt Text Guide', url: 'https://moz.com/learn/seo/alt-text' }
        ]
      },
      'Slow Page Load Time': {
        impact: 'Slow loading pages rank lower in search results and have higher bounce rates',
        solution: 'Optimize images, enable compression, and minimize JavaScript/CSS files',
        codeExample: '// Enable gzip compression in your server configuration\n// Optimize images using tools like TinyPNG\n// Minify CSS and JavaScript files',
        estimatedTime: '2-4 hours',
        difficulty: 'Medium',
        resources: [
          { title: 'PageSpeed Insights', url: 'https://pagespeed.web.dev/' },
          { title: 'Core Web Vitals Guide', url: 'https://web.dev/vitals/' }
        ]
      }
    };

    return explanations[issue.title] || {
      impact: 'This issue may affect your search engine rankings and user experience',
      solution: 'Review the issue description and implement the recommended fixes',
      codeExample: '// Specific implementation details will depend on your website platform',
      estimatedTime: '30 minutes',
      difficulty: 'Medium',
      resources: [
        { title: 'SEO Best Practices', url: 'https://developers.google.com/search/docs' }
      ]
    };
  };

  const config = getSeverityConfig(issue.severity);
  const categoryConfig = getCategoryConfig(issue.category);
  const IconComponent = config.icon;
  const CategoryIcon = categoryConfig.icon;
  const details = getDetailedExplanation(issue);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNavigateToSection = () => {
    if (onNavigateToSection) {
      // Generate section ID based on issue category
      const sectionId = issue.category === 'content' ? 'onpage' :
                       issue.category === 'performance' ? 'performance' :
                       'issues';
      onNavigateToSection(sectionId);
    }
  };

  return (
    <div className={`border ${config.borderColor} rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${isMarkedAsFixed ? 'opacity-60' : ''}`}>
      {/* Issue Header */}
      <div className={`${config.bgColor} border-b ${config.borderColor}`}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-1">
                <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`font-semibold ${config.textColor}`}>{issue.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.badgeColor}`}>
                    {issue.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                    {categoryConfig.label}
                  </span>
                </div>
                <p className={`text-sm ${config.textColor} opacity-90`}>{issue.description}</p>

                {/* Quick Actions */}
                <div className="flex items-center space-x-3 mt-3">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center space-x-1 text-xs ${config.textColor} hover:underline font-medium`}
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>{isExpanded ? 'Hide Details' : 'Show Fix Guide'}</span>
                  </button>

                  <button
                    onClick={handleNavigateToSection}
                    className={`flex items-center space-x-1 text-xs ${config.textColor} hover:underline`}
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Go to Section</span>
                  </button>

                  <button
                    onClick={() => setIsMarkedAsFixed(!isMarkedAsFixed)}
                    className={`flex items-center space-x-1 text-xs ${isMarkedAsFixed ? 'text-green-600' : config.textColor} hover:underline`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isMarkedAsFixed ? 'Fixed' : 'Mark as Fixed'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Impact Score */}
            <div className="text-right">
              <div className={`text-sm font-semibold ${config.textColor}`}>
                Impact: {issue.impact}/10
              </div>
              <div className="w-16 bg-white rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    issue.impact >= 8 ? 'bg-red-500' :
                    issue.impact >= 6 ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${issue.impact * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="bg-white border-t border-gray-200">
          <div className="p-6 space-y-6">
            {/* Why This Matters */}
            <div>
              <h4 className="flex items-center font-semibold text-gray-800 mb-2">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                Why This Matters
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">{details.impact}</p>
            </div>

            {/* How to Fix */}
            <div>
              <h4 className="flex items-center font-semibold text-gray-800 mb-2">
                <Target className="w-4 h-4 mr-2 text-green-500" />
                How to Fix
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">{details.solution}</p>

              {/* Code Example */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Code Example:</span>
                  <button
                    onClick={() => handleCopy(details.codeExample)}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {copiedText === details.codeExample ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs text-gray-800 font-mono overflow-x-auto">
                  <code>{details.codeExample}</code>
                </pre>
              </div>
            </div>

            {/* Implementation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800">Estimated Time</span>
                </div>
                <span className="text-sm text-blue-700">{details.estimatedTime}</span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-800">Difficulty</span>
                </div>
                <span className="text-sm text-green-700">{details.difficulty}</span>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <CategoryIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-800">Category</span>
                </div>
                <span className="text-sm text-purple-700">{categoryConfig.label}</span>
              </div>
            </div>

            {/* Additional Resources */}
            {details.resources && details.resources.length > 0 && (
              <div>
                <h4 className="flex items-center font-semibold text-gray-800 mb-2">
                  <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />
                  Learn More
                </h4>
                <div className="space-y-2">
                  {details.resources.map((resource: any, idx: number) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{resource.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}