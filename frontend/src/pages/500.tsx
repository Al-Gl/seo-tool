import React from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function ServerErrorPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Layout 
      title="Server Error - SEO Analyzer"
      description="Something went wrong on our end. Please try again later."
      hideFooter={true}
    >
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6">⚠️</div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Server Error
              </h1>
              
              <p className="text-gray-600 mb-8">
                Something went wrong on our end. We're working to fix this issue.
              </p>

              <div className="space-y-4">
                <Button onClick={handleRefresh} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Error Code: 500 - Internal Server Error
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  If this problem persists, please{' '}
                  <Link 
                    href="/contact" 
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    contact support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}