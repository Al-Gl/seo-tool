import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, 
  TrendingUp, 
  Zap, 
  Shield, 
  CheckCircle, 
  BarChart3,
  Globe,
  Clock,
  Users,
  Star,
  ArrowRight,
  FileText,
  Smartphone,
  Eye
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const features = [
  {
    icon: Search,
    title: 'Comprehensive SEO Analysis',
    description: 'Deep dive into all aspects of your SEO including technical, content, and performance factors.',
    details: [
      'Technical SEO audit with detailed recommendations',
      'Content quality and optimization analysis',
      'Page speed and Core Web Vitals assessment',
      'Mobile responsiveness evaluation'
    ]
  },
  {
    icon: TrendingUp,
    title: 'Actionable Insights',
    description: 'Get specific recommendations with priority levels to improve your search rankings effectively.',
    details: [
      'Priority-based recommendation system',
      'Quick wins for immediate improvements',
      'Long-term strategic SEO planning',
      'Performance tracking over time'
    ]
  },
  {
    icon: Zap,
    title: 'AI-Powered Analysis',
    description: 'Leverage advanced AI technology for intelligent analysis and personalized recommendations.',
    details: [
      'Google Gemini AI integration',
      'Context-aware SEO recommendations',
      'Industry-specific optimization tips',
      'Intelligent content gap analysis'
    ]
  },
  {
    icon: Shield,
    title: 'Professional Grade',
    description: 'Enterprise-level analysis tools used by marketing professionals and agencies worldwide.',
    details: [
      'Agency-ready white-label reports',
      'Bulk analysis capabilities',
      'Team collaboration features',
      'API access for integrations'
    ]
  },
  {
    icon: FileText,
    title: 'Detailed Reports',
    description: 'Generate comprehensive PDF reports with actionable insights and professional presentation.',
    details: [
      'Professional PDF report generation',
      'Custom branding options',
      'Executive summary sections',
      'Technical implementation guides'
    ]
  },
  {
    icon: BarChart3,
    title: 'Performance Tracking',
    description: 'Monitor your SEO improvements over time with detailed analytics and progress tracking.',
    details: [
      'Historical performance data',
      'Trend analysis and forecasting',
      'Competitor comparison metrics',
      'Goal setting and progress tracking'
    ]
  }
];

const analysisTypes = [
  {
    title: 'Complete SEO Audit',
    description: 'Comprehensive analysis covering all aspects of SEO',
    icon: Globe,
    features: ['Technical SEO', 'Content Analysis', 'Performance Review', 'Recommendations']
  },
  {
    title: 'Content Analysis',
    description: 'Focus on content quality and optimization opportunities',
    icon: FileText,
    features: ['Content Quality', 'Keyword Analysis', 'Readability', 'Structure Review']
  },
  {
    title: 'Technical SEO',
    description: 'Deep technical analysis of website performance',
    icon: Zap,
    features: ['Core Web Vitals', 'Mobile Optimization', 'Schema Markup', 'Site Speed']
  },
  {
    title: 'Competitor Analysis',
    description: 'Compare your site against industry standards',
    icon: TrendingUp,
    features: ['Benchmarking', 'Gap Analysis', 'Opportunities', 'Strategic Planning']
  }
];

export default function FeaturesPage() {
  return (
    <Layout>
      <Head>
        <title>Features - SEO Crawler & AI Analysis Platform</title>
        <meta name="description" content="Discover the powerful features of our AI-powered SEO analysis platform. Comprehensive audits, actionable insights, and professional reports." />
        <meta name="keywords" content="SEO features, website analysis, AI SEO tools, technical SEO, content optimization" />
      </Head>

      <div className="py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful SEO Analysis
              <span className="block text-primary-600">Features</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Comprehensive SEO analysis tools powered by artificial intelligence to help you 
              optimize your website and improve search engine rankings.
            </p>
            <Button asChild size="lg">
              <Link href="/">
                Try Analysis Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Main Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                      <feature.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Types Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Multiple Analysis Types
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from different analysis types tailored to your specific SEO needs and objectives.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analysisTypes.map((type, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                        <type.icon className="w-8 h-8 text-primary-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{type.description}</p>
                    <ul className="space-y-1">
                      {type.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-700">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-primary-50 rounded-2xl p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our SEO Platform?
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of marketers and agencies who trust our platform for their SEO analysis needs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Clock className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Time</h3>
                <p className="text-gray-600">
                  Get comprehensive SEO analysis in minutes, not hours. Automated insights save you valuable time.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Eye className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Insights</h3>
                <p className="text-gray-600">
                  AI-powered analysis provides expert-level insights and recommendations you can trust.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TrendingUp className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Improve Rankings</h3>
                <p className="text-gray-600">
                  Actionable recommendations help you improve search engine rankings and drive more traffic.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Analyze Your Website?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Start your comprehensive SEO analysis today and discover opportunities to improve your search engine rankings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  Start Free Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/docs">
                  View Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}