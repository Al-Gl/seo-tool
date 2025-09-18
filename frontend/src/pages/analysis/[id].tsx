import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  AlertCircle // <-- The missing import is now correctly added
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
  // --- ALL HOOKS ARE NOW AT THE TOP LEVEL ---
  const router = useRouter();
  const [isRerunning, setIsRerunning] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { data: analysis, isLoading, error, refetch } = useAnalysis(analysisId);
  const submitMutation = useSubmitAnalysis();
  const [retryCount, setRetryCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (error && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refetch();
      }, 2000);
      return () => clearTimeout(retryTimer);
    } else if (error && retryCount >= 3) {
      setShowRetry(true);
    }
  }, [error, retryCount, refetch, analysisId]);
  
  // --- CONDITIONAL RETURNS NOW HAPPEN AFTER ALL HOOKS ---

  if (isLoading) {
    return (
      <Layout title="Loading Analysis - PulsarRank">
        <div className="flex items-center justify-center min-h-screen bg-space-900">
          <p className="text-gray-100">Loading analysis results...</p>
        </div>
      </Layout>
    );
  }

  if (!analysis || (error && showRetry)) {
    return (
      <Layout title="Error - PulsarRank">
        <div className="flex items-center justify-center min-h-screen bg-space-900">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-100 mb-2">
                Analysis Not Found or Failed
              </h1>
              <p className="text-gray-400 mb-6">
                The analysis you're looking for couldn't be loaded.
              </p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // --- REST OF THE COMPONENT LOGIC ---

  const { status, url, updatedAt } = analysis;
  const isCompleted = status === 'completed';
  const domain = extractDomain(url);
  const pageTitle = `Analysis for ${domain}`;

  const handleRerun = async () => {
    setIsRerunning(true);
    toast.loading('Starting new analysis...');
    try {
      const newAnalysis = await submitMutation.mutateAsync({ url: analysis.url });
      toast.dismiss();
      toast.success('New analysis started!');
      router.push(`/analysis/${newAnalysis.analysisId}`);
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to start new analysis.');
    } finally {
      setIsRerunning(false);
    }
  };

  const handleShare = async () => {
    const shareableUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setShareUrl(shareableUrl);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setShareUrl(''), 3000);
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };
  
  return (
    <Layout title={pageTitle} description={`Results for ${url}`}>
      <div className="min-h-screen bg-space-900">
        <div className="bg-space-800 border-b border-space-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> New Analysis
                </Button>
                <div className="h-6 w-px bg-space-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-100 truncate" title={url}>
                    {domain}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {formatRelativeTime(updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={handleRerun} disabled={isRerunning}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Re-run Analysis
                </Button>
                {isCompleted && (
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    {shareUrl ? <CheckCircle className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                    {shareUrl ? 'Copied!' : 'Share'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isCompleted && analysis.seoAnalysis ? (
              <ResultsDashboard
                results={analysis}
                analysisId={analysisId}
                analysisUrl={analysis.url}
              />
            ) : (
              <ProgressTracker
                status={status}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  if (!id || typeof id !== 'string') {
    return { notFound: true };
  }
  return {
    props: {
      analysisId: id,
    },
  };
};