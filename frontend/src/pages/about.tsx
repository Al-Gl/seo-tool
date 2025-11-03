import React from 'react';
import Link from 'next/link';
import { Search, Zap, ArrowRight, Award, TrendingUp, Users, Clock, Brain, Target, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced algorithms analyze your website like an experienced SEO consultant, providing insights in seconds.'
  },
  {
    icon: Target,
    title: 'Actionable Recommendations',
    description: 'Every issue comes with clear explanations and step-by-step implementation guidance.'
  },
  {
    icon: TrendingUp,
    title: 'Performance Tracking',
    description: 'Monitor your SEO improvements over time with comprehensive performance metrics.'
  },
  {
    icon: Shield,
    title: 'Best Practice Compliance',
    description: 'Ensure your website follows the latest SEO best practices and search engine guidelines.'
  }
];

const capabilities = [
  'Technical SEO Analysis',
  'Page Speed Optimization',
  'Mobile-First Indexing Check',
  'Core Web Vitals Assessment',
  'Meta Tags Optimization',
  'Schema Markup Validation',
  'Internal Link Structure',
  'Image Optimization',
  'Content Quality Analysis',
  'Keyword Density Review',
  'URL Structure Assessment',
  'Security & HTTPS Check'
];

export default function AboutPage() {
  return (
    <Layout
      title="About PulsarRank - AI-Powered SEO Analysis Platform"
      description="Discover how PulsarRank uses advanced AI to analyze your website's SEO performance. Get actionable insights and recommendations to improve your search rankings."
    >
      {/* Hero Section */}
      <section className="bg-space-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-accent-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About <span className="text-gradient-pulsar">PulsarRank</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              PulsarRank is an advanced AI-powered SEO analysis platform that helps businesses 
              identify and fix website optimization issues with stellar accuracy. Get professional-grade 
              SEO insights that actually move the needle.
            </p>

            <div className="flex justify-center space-x-4">
              <Link 
                href="/"
                className="inline-flex items-center px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Zap className="w-5 h-5 mr-2" />
                Try Free Analysis
              </Link>
              
              <Link 
                href="/pricing"
                className="inline-flex items-center px-6 py-3 bg-transparent border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white font-medium rounded-lg transition-colors duration-200"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-space-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              How PulsarRank Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform combines advanced algorithms with proven SEO methodologies 
              to deliver comprehensive website analysis and actionable optimization recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center bg-space-700 border-space-600 hover:border-accent-600 transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-900 bg-opacity-30 rounded-full mb-6 border border-accent-800">
                    <feature.icon className="w-8 h-8 text-accent-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Technology & Approach */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Advanced Technology</h3>
              <div className="space-y-6 text-gray-300">
                <p>
                  PulsarRank leverages cutting-edge artificial intelligence and machine learning 
                  algorithms to analyze your website's SEO performance. Our platform processes 
                  hundreds of ranking factors in real-time to provide comprehensive insights.
                </p>
                
                <p>
                  Unlike traditional SEO tools that simply flag issues, PulsarRank understands 
                  the context and priority of each optimization opportunity, helping you focus 
                  on changes that will have the biggest impact on your search rankings.
                </p>
                
                <p>
                  Our AI has been trained on massive datasets of successful SEO campaigns and 
                  search engine algorithm updates, ensuring recommendations align with current 
                  best practices and emerging trends.
                </p>
                
                <p>
                  The platform continuously learns and adapts, staying current with the latest 
                  SEO developments and algorithm changes to provide you with the most accurate 
                  and effective optimization strategies.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Analysis Capabilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {capabilities.map((capability, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 bg-space-700 rounded-lg border border-space-600"
                  >
                    <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-16 bg-space-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our SEO Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-space-800 border-space-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">User-First Approach</h3>
                <p className="text-gray-300">
                  PulsarRank prioritizes user experience and intent in every recommendation. 
                  We believe great SEO serves users first, with search engines following 
                  naturally.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-space-800 border-space-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Data-Driven Insights</h3>
                <p className="text-gray-300">
                  Every recommendation is backed by comprehensive data analysis. Our AI 
                  processes real performance metrics to provide actionable insights you can trust.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-space-800 border-space-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Sustainable Practices</h3>
                <p className="text-gray-300">
                  PulsarRank focuses on white-hat SEO techniques that build long-term authority 
                  and resilience against algorithm changes, ensuring lasting results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-accent-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="hero-glow absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Why Choose PulsarRank
          </h2>
          
          <p className="text-xl text-white text-opacity-90 mb-8 max-w-3xl mx-auto">
            PulsarRank bridges the gap between complex SEO tools and oversimplified solutions. 
            Our AI-powered platform delivers comprehensive analysis that's both detailed and 
            accessible, helping businesses of all sizes improve their search visibility.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Instant Results</h3>
              <p className="text-white text-opacity-80 text-sm">
                Get comprehensive SEO analysis in seconds, not hours. Our AI processes 
                your website instantly to identify optimization opportunities.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Expert-Level Analysis</h3>
              <p className="text-white text-opacity-80 text-sm">
                Advanced algorithms trained on successful SEO campaigns analyze your site 
                like a seasoned consultant would, but faster and more consistently.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Clear Guidance</h3>
              <p className="text-white text-opacity-80 text-sm">
                Complex SEO concepts explained in simple terms with step-by-step 
                implementation guides that anyone can follow.
              </p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-4 bg-white text-accent-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors duration-200"
          >
            Start Your Free SEO Analysis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-16 bg-space-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Optimize Your Website?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of websites already using PulsarRank to identify SEO opportunities 
            and improve their search rankings. Get started with your free analysis today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <Zap className="w-5 h-5 mr-3" />
              Start Free Analysis
            </Link>
            
            <Link 
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              View Pricing Plans
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-space-700">
            <p className="text-gray-400">
              Questions about PulsarRank? Check out our blog for SEO tips and guides.
            </p>
            <Link 
              href="/blog"
              className="inline-flex items-center text-accent-400 hover:text-accent-300 font-medium mt-2"
            >
              Visit our SEO blog
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}