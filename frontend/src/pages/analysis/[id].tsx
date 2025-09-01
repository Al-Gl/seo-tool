import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  RefreshCw, 
  Share2, 
  Download,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAnalysis, useSubmitAnalysis } from '@/hooks/useAnalysis';
import { AnalysisResponse } from '@/types';
import { extractDomain, formatRelativeTime } from '@/lib/utils';

interface AnalysisPageProps {
  analysisId: string;
}

export default function AnalysisPage({ analysisId }: AnalysisPageProps) {
  const router = useRouter();
  const [isRerunning, setIsRerunning] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  const { data: analysis, isLoading, error, refetch } = useAnalysis(analysisId);
  
  // Debug logging
  console.log('📄 Analysis page - Current state:', {
    analysisId,
    hasAnalysis: !!analysis,
    analysisStatus: analysis?.status,
    isLoading,
    hasError: !!error,
    errorDetails: error ? {
      message: error.message,
      name: error.name
    } : null,
    timestamp: new Date().toISOString()
  });
  
  // Log when component mounts/unmounts
  React.useEffect(() => {
    console.log('📄 Analysis page mounted for ID:', analysisId);
    return () => {
      console.log('📄 Analysis page unmounted for ID:', analysisId);
    };
  }, [analysisId]);
  const submitAnalysis = useSubmitAnalysis();

  // Handle loading state (including retries)
  if (isLoading || (error && retryCount < 3 && !showRetry)) {
    return (
      <Layout 
        title="Loading Analysis - SEO Analyzer"
        description="Loading your SEO analysis results..."
      >
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Add retry mechanism with delay for temporary failures
  const [retryCount, setRetryCount] = React.useState(0);
  const [showRetry, setShowRetry] = React.useState(false);
  
  React.useEffect(() => {
    if (error && retryCount < 3) {
      console.log(`🔄 Analysis page error detected, will retry in 2s (attempt ${retryCount + 1}/3)`);
      const retryTimer = setTimeout(() => {
        console.log(`🔄 Retrying analysis fetch for ID: ${analysisId}`);
        setRetryCount(prev => prev + 1);
        refetch();
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    } else if (error && retryCount >= 3) {
      console.log('❌ Max retries reached, showing error page');
      setShowRetry(true);
    }
  }, [error, retryCount, refetch, analysisId]);
  
  // Handle error state (only after retries)
  if ((error || !analysis) && showRetry) {
    return (
      <Layout 
        title="Analysis Not Found - SEO Analyzer"
        description="The requested SEO analysis could not be found."
      >
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Analysis Not Found
                </h1>
                <p className="text-gray-600 mb-6">
                  The analysis you're looking for doesn't exist or may have been removed.
                </p>
                <Button onClick={() => {
                  console.log('🏠 "Go Back Home" clicked from analysis page - Analysis ID:', analysisId);
                  console.log('🏠 Error details:', error);
                  router.push('/');
                }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle in-progress analysis
  const isInProgress = ['pending', 'crawling', 'analyzing'].includes(analysis.status);
  const isFailed = analysis.status === 'failed';
  const isCancelled = analysis.status === 'cancelled';
  const isCompleted = analysis.status === 'completed';

  // Get page title and description
  const domain = extractDomain(analysis.url);
  const pageTitle = isCompleted 
    ? `SEO Analysis Results for ${domain} - SEO Analyzer`
    : `SEO Analysis in Progress for ${domain} - SEO Analyzer`;
  
  const pageDescription = isCompleted
    ? `Comprehensive SEO analysis results for ${domain} including technical issues, content recommendations, and performance metrics.`
    : `SEO analysis for ${domain} is currently in progress. Check back for results.`;

  // Handle re-run analysis
  const handleRerun = async () => {
    try {
      setIsRerunning(true);
      const newAnalysis = await submitAnalysis.mutateAsync({
        url: analysis.url,
        analysisType: analysis.analysisType,
        customPrompt: analysis.customPrompt
      });
      
      toast.success('New analysis started!');
      router.push(`/analysis/${newAnalysis.id}`);
    } catch (error) {
      toast.error('Failed to start new analysis');
      console.error('Re-run analysis error:', error);
    } finally {
      setIsRerunning(false);
    }
  };

  // Handle share results
  const handleShare = async () => {
    const url = `${window.location.origin}/analysis/${analysisId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SEO Analysis Results for ${domain}`,
          text: `Check out the SEO analysis results for ${domain}`,
          url: url,
        });
      } catch (error) {
        // Fallback to copy to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      toast.success('Link copied to clipboard!');
      
      // Reset after 3 seconds
      setTimeout(() => setShareUrl(''), 3000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Handle PDF generation
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    // This will be handled by the ResultsDashboard component
    setTimeout(() => setIsGeneratingPdf(false), 3000);
  };

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Back button and title */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {domain}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatRelativeTime(analysis.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                {isCompleted && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center"
                    >
                      {shareUrl ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(analysis.url, '_blank')}
                      className="flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Site
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRerun}
                  loading={isRerunning}
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* In Progress State */}
            {isInProgress && (
              <div className="mb-8">
                <ProgressTracker
                  status={analysis.status}
                  progress={analysis.progress}
                  estimatedTimeRemaining={analysis.estimatedTimeRemaining}
                />
              </div>
            )}

            {/* Failed State */}
            {isFailed && (
              <Card className="mb-8 border-danger-200">
                <CardContent className="p-8 text-center">
                  <div className="text-danger-600 text-6xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Analysis Failed
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We encountered an error while analyzing your website. 
                    This could be due to connectivity issues or website accessibility problems.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={handleRerun}
                      loading={isRerunning}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => router.push('/')}
                    >
                      Start New Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled State */}
            {isCancelled && (
              <Card className="mb-8">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">🚫</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Analysis Cancelled
                  </h2>
                  <p className="text-gray-600 mb-6">
                    The analysis was cancelled before completion. 
                    You can start a new analysis anytime.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={handleRerun} loading={isRerunning}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart Analysis
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => router.push('/')}
                    >
                      Start New Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed State - Show Results */}
            {isCompleted && analysis.seoAnalysis && (
              <ResultsDashboard
                results={analysis}
                analysisId={analysisId}
                analysisUrl={analysis.url}
                isGeneratingPdf={isGeneratingPdf}
                onShareResults={handleShare}
              />
            )}

            {/* Polling notice for in-progress analysis */}
            {isInProgress && (
              <Card className="mt-6">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-500">
                    This page will automatically update when your analysis is complete. 
                    You can also bookmark this page and return later.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Server-side props to get the analysis ID
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  // Validate ID format (basic validation)
  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      analysisId: id,
    },
  };
};