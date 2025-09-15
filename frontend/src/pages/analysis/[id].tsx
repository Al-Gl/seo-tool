import React, 'react';
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
  AlertCircle // <-- The missing import is now added
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
  const [isRerunning, setIsRerunning] = React.useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState('');
  
  const { data: analysis, isLoading, error, refetch } = useAnalysis(analysisId);
  const submitMutation = useSubmitAnalysis();

  // --- Conditional returns must happen after all hooks ---
  
  if (isLoading) {
    return (
      <Layout 
        title="Loading Analysis - PulsarRank"
        description="Loading your SEO analysis results..."
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Loading analysis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !analysis) {
    return (
      <Layout 
        title="Analysis Not Found - PulsarRank"
        description="The requested SEO analysis could not be found."
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Analysis Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The analysis you're looking for doesn't exist or an error occurred.
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

  // --- Component Logic & Handlers ---

  const isCompleted = analysis.status === 'completed';
  const domain = extractDomain(analysis.url);
  const pageTitle = `SEO Analysis for ${domain}`;

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
      console.error('Re-run analysis error:', err);
    } finally {
      setIsRerunning(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setShareUrl(''), 3000);
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };
  
  return (
    <Layout title={pageTitle} description={`Results for ${analysis.url}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> New Analysis
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 truncate" title={analysis.url}>
                    {domain}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatRelativeTime(analysis.updatedAt)}
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

        {/* Content */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isCompleted ? (
              <ResultsDashboard
                results={analysis}
                analysisId={analysisId}
                analysisUrl={analysis.url}
              />
            ) : (
              <ProgressTracker
                // You'll need to pass the status polling data here
                // For now, it shows the initial status
                status={analysis.status}
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