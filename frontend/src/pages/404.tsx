import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function NotFoundPage() {
  return (
    <Layout 
      title="Page Not Found - SEO Analyzer"
      description="The page you're looking for doesn't exist."
      hideFooter={true}
    >
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6">🔍</div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Page Not Found
              </h1>
              
              <p className="text-gray-600 mb-8">
                The page you're looking for doesn't exist or may have been moved.
              </p>

              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  If you think this is an error, please{' '}
                  <Link 
                    href="/contact" 
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    contact us
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