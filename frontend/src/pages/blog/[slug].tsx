import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BlogPost, getAllBlogPosts, getBlogPostBySlug } from '@/data/blogPosts';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import dynamic from 'next/dynamic';

// Dynamically import components that use browser-only APIs
const BlogContentRenderer = dynamic(
  () => import('@/components/blog/BlogContentRenderer').then((mod) => mod.BlogContentRenderer),
  { ssr: false }
);

const TableOfContents = dynamic(
  () => import('@/components/blog/TableOfContents').then((mod) => mod.TableOfContents),
  { ssr: false }
);

interface BlogPostPageProps {
  post: BlogPost;
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout
      title={post.metaTitle}
      description={post.metaDescription}
    >
      <ReadingProgress />
      <article className="bg-space-900">
        {/* Hero Section */}
        <section className="bg-space-gradient py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Link 
                href="/blog"
                className="inline-flex items-center text-accent-400 hover:text-accent-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-semibold text-accent-400 bg-accent-900 bg-opacity-30 px-3 py-1 rounded-full border border-accent-800">
                  {post.category}
                </span>
                <div className="flex items-center text-sm text-gray-400 space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center justify-between pt-6">
                <div className="flex items-center space-x-4 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>By </span>
                    <Link 
                      href="/about"
                      className="text-accent-400 hover:text-accent-300 transition-colors font-medium"
                    >
                      {post.author}
                    </Link>
                  </div>
                  <div className="w-px h-4 bg-gray-600"></div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-accent-400 hover:bg-accent-900 hover:bg-opacity-30"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-space-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-12">
              {/* Main Content */}
              <div className="flex-1 max-w-4xl">
                <BlogContentRenderer content={post.content} />
              </div>
              
              {/* Sidebar */}
              <div className="hidden xl:block w-80">
                <TableOfContents content={post.content} />
              </div>
            </div>
          </div>
        </section>

        {/* Author Bio */}
        <section className="py-12 bg-space-800 border-t border-space-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-space-700 border-space-600">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      About {post.author}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      PulsarRank is an AI-powered SEO analysis platform that helps businesses identify and fix 
                      website optimization issues with stellar accuracy. Our expert insights are backed by advanced 
                      algorithms and proven SEO methodologies.
                    </p>
                    <Link 
                      href="/about"
                      className="inline-flex items-center text-accent-400 hover:text-accent-300 transition-colors font-medium"
                    >
                      Learn more about PulsarRank
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-accent-600 to-purple-600">
          <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Optimize Your Website?
            </h2>
            <p className="text-xl text-white text-opacity-90 mb-8">
              Get a comprehensive SEO analysis and discover specific opportunities 
              to improve your search rankings.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-8 py-4 bg-white text-accent-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors duration-200"
            >
              Start Free SEO Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllBlogPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  const post = getBlogPostBySlug(params?.slug as string);

  if (!post) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      post
    }
  };
};