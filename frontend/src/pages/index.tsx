import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  Search,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle,
  BarChart3,
  Star
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { URLInput } from '@/components/URLInput';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAnalysisFlow } from '@/hooks/useAnalysis';
import { URLInputFormData } from '@/types';

const features = [
  {
    icon: Search,
    title: 'Comprehensive Analysis',
    description: 'Deep dive into all aspects of your SEO including technical, content, and performance factors.'
  },
  {
    icon: TrendingUp,
    title: 'Actionable Insights',
    description: 'Get specific recommendations with priority levels to improve your search rankings effectively.'
  },
  {
    icon: Zap,
    title: 'AI-Powered',
    description: 'Leverage advanced AI technology for intelligent analysis and personalized recommendations.'
  },
  {
    icon: Shield,
    title: 'Professional Grade',
    description: 'Enterprise-level analysis tools used by marketing professionals and agencies worldwide.'
  }
];

const benefits = [
  'Complete technical SEO audit',
  'Content optimization recommendations',
  'Performance and speed analysis',
  'Mobile-friendliness assessment',
  'Competitor comparison insights',
  'Custom analysis options'
];


export default function HomePage() {
  const router = useRouter();
  const [showResults, setShowResults] = useState(false);
  const [preventAutoRestart, setPreventAutoRestart] = useState(false);
  
  // Add debugging for component renders
  console.log('🏠 HomePage render - Current state:', {
    showResults,
    timestamp: new Date().toISOString()
  });
  
  const {
    submitAnalysis,
    loadingState,
    errorState,
    analysis,
    statusData,
    currentAnalysisId,
    cancelAnalysis,
    reset,
    isSubmitting,
    isCancelling
  } = useAnalysisFlow();
  
  // Debug analysis flow state
  console.log('🔍 Analysis Flow State:', {
    currentAnalysisId,
    loadingState: loadingState.isLoading,
    statusData: statusData ? {
      status: statusData.status,
      progress: statusData.progress
    } : null,
    isSubmitting,
    showResults,
    preventAutoRestart
  });
  
  // Detect navigation back from analysis page
  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url === '/') {
        console.log('🔙 Navigated back to home page');
        setPreventAutoRestart(true);
        // Clear the analysis state when coming back to prevent restart
        if (showResults && currentAnalysisId) {
          console.log('🛑 Preventing auto-restart - clearing state');
          setShowResults(false);
          // Don't reset the analysis data, just stop showing results
        }
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, showResults, currentAnalysisId]);

  // Handle completion and redirect
  useEffect(() => {
    console.log('🔄 Status effect triggered:', {
      showResults,
      statusData: statusData ? {
        status: statusData.status,
        progress: statusData.progress
      } : null,
      currentAnalysisId
    });
    
    if (showResults && statusData?.status === 'completed' && currentAnalysisId) {
      console.log('✅ Analysis completed, redirecting to results page...', {
        analysisId: currentAnalysisId,
        status: statusData.status,
        progress: statusData.progress
      });
      toast.success('Analysis complete! Showing results...', { duration: 1000 });
      
      // Immediate redirect to reduce timing issues
      const redirectTimer = setTimeout(() => {
        console.log('🚀 Redirecting to:', `/analysis/${currentAnalysisId}`);
        router.push(`/analysis/${currentAnalysisId}`);
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    } else if (showResults && statusData?.status === 'failed') {
      console.log('❌ Analysis failed');
      toast.error('Analysis failed. Please try again.');
    }
  }, [statusData?.status, showResults, currentAnalysisId, router]);

  const handleAnalysisSubmit = async (data: URLInputFormData) => {
    console.log('🚀 Form submission triggered:', {
      data,
      currentState: {
        showResults,
        currentAnalysisId,
        isSubmitting,
        loadingState: loadingState.isLoading,
        preventAutoRestart
      },
      timestamp: new Date().toISOString()
    });
    
    // Prevent multiple submissions
    if (isSubmitting || loadingState.isLoading) {
      console.log('⚠️ Submission blocked - already in progress');
      toast.error('Analysis already in progress...');
      return;
    }
    
    // Clear the prevent restart flag for new submissions
    setPreventAutoRestart(false);
    
    try {
      console.log('📤 Calling submitAnalysis...');
      const result = await submitAnalysis(data);
      
      console.log('✅ Analysis submission successful:', result);
      setShowResults(true);
      
      toast.success('Analysis started successfully!', {
        duration: 3000,
      });

    } catch (error) {
      console.error('❌ Analysis submission error:', error);
      toast.error('Failed to start analysis. Please try again.');
    }
  };

  const handleCancel = async () => {
    console.log('🚫 Cancel triggered');
    try {
      await cancelAnalysis();
      setShowResults(false);
      console.log('✅ Analysis cancelled, showResults set to false');
      toast.success('Analysis cancelled successfully');
    } catch (error) {
      console.error('❌ Failed to cancel analysis:', error);
      toast.error('Failed to cancel analysis');
    }
  };

  const handleStartOver = () => {
    console.log('🔄 Start over triggered - resetting state');
    reset();
    setShowResults(false);
    console.log('✅ State reset complete');
  };

  // Show results/progress if analysis is in progress or completed
  if (showResults && currentAnalysisId) {
    return (
      <Layout 
        title="SEO Analysis in Progress - SEO Analyzer"
        description="Your SEO analysis is being processed. Please wait for the results."
      >
        <div className="min-h-screen bg-space-gradient py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                onClick={handleStartOver}
                className="mb-4"
              >
                ← Start New Analysis
              </Button>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                Analyzing Your Website
              </h1>
              <p className="text-gray-300">
                We're conducting a comprehensive SEO analysis of your website
              </p>
            </div>

            <ProgressTracker
              status={statusData?.status || 'pending'}
              progress={loadingState.progress}
              currentStep={loadingState.message}
              onCancel={handleCancel}
              isCancelling={isCancelling}
              loadingState={loadingState}
            />

            {errorState.hasError && (
              <Card className="mt-6 border-danger-600 bg-space-800">
                <CardContent className="p-6 text-center">
                  <div className="text-danger-400 mb-2">
                    <Search className="w-8 h-8 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-100 mb-2">
                    Analysis Failed
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {errorState.message || 'Something went wrong during the analysis.'}
                  </p>
                  <Button onClick={handleStartOver} className="bg-accent-500 hover:bg-accent-600 text-white">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-space-gradient py-20 overflow-hidden">
        {/* Space background elements */}
        <div className="absolute inset-0">
          <div className="hero-glow absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"></div>
          <div className="hero-glow absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-accent-900 bg-opacity-30 text-accent-300 rounded-full text-sm font-medium mb-6 border border-accent-800">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 12,000+ Marketing Professionals
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Pinpoint Your SEO Weaknesses{' '}
              <br />with{' '}
              <span className="text-gradient-pulsar">Stellar Accuracy</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Professional SEO analysis powered by AI. Get comprehensive insights,
              actionable recommendations, and detailed performance analysis to dominate search rankings.
            </p>

          </div>

          {/* URL Input Form */}
          <div className="mb-16">
            <URLInput 
              onSubmit={handleAnalysisSubmit} 
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-space-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Why Choose PulsarRank?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our advanced AI-powered platform provides comprehensive analysis 
              and actionable insights to help you dominate search results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 bg-space-700 border-space-600">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-900 bg-opacity-30 rounded-full mb-6 border border-accent-800">
                    <feature.icon className="w-8 h-8 text-accent-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-space-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Everything You Need for{' '}
                <span className="text-accent-400">SEO Dominance</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Our comprehensive analysis covers all aspects of SEO to give you 
                a complete picture of your website's performance and opportunities.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-accent-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="text-lg px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white">
                Start Free Analysis
              </Button>
            </div>

            <div className="lg:pl-12">
              <Card className="p-8 bg-space-800 border-space-700">
                <div className="space-y-6">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">
                      Sample SEO Score
                    </h3>
                    <div className="text-3xl font-bold text-accent-400 mb-2">85/100</div>
                    <p className="text-gray-400 text-sm">
                      See how your website measures up
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Technical SEO</span>
                      <span className="text-sm font-semibold text-accent-400">92%</span>
                    </div>
                    <div className="w-full bg-space-600 rounded-full h-2">
                      <div className="bg-accent-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Content Quality</span>
                      <span className="text-sm font-semibold text-purple-400">78%</span>
                    </div>
                    <div className="w-full bg-space-600 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '78%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Performance</span>
                      <span className="text-sm font-semibold text-accent-400">88%</span>
                    </div>
                    <div className="w-full bg-space-600 rounded-full h-2">
                      <div className="bg-accent-500 h-2 rounded-full" style={{width: '88%'}}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-accent-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="hero-glow absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Dominate Search Rankings?
          </h2>
          <p className="text-xl text-white text-opacity-90 mb-8">
            Join thousands of marketers who trust PulsarRank to optimize their websites 
            and achieve stellar search performance.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 bg-white text-accent-600 hover:bg-gray-100 font-semibold"
            onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Your Free Analysis Now
          </Button>
        </div>
      </section>
    </Layout>
  );
}