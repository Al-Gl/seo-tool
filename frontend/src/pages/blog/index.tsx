import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { getAllBlogPosts } from '@/data/blogPosts';

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();
  return (
    <Layout
      title="SEO Blog - Expert Tips and Guides | PulsarRank"
      description="Discover expert SEO tips, guides, and strategies from PulsarRank. Learn how to improve your website's search rankings with actionable insights."
    >
      {/* Hero Section */}
      <section className="bg-space-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            SEO Insights & <span className="text-gradient-pulsar">Expert Tips</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Learn SEO strategies, tips, and best practices to dominate search rankings. 
            Written by SEO experts and powered by AI-driven insights.
          </p>
          <div className="flex items-center justify-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>By PulsarRank</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <span>{blogPosts.length} Articles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-space-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card 
                key={post.slug} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-space-800 border-space-700 hover:border-accent-600"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-accent-400 bg-accent-900 bg-opacity-30 px-2 py-1 rounded-full border border-accent-800">
                      {post.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-400 space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-accent-400 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="flex items-center text-accent-400 hover:text-accent-300 text-sm font-medium transition-colors group"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-accent-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Put These Tips Into Action?
          </h2>
          <p className="text-xl text-white text-opacity-90 mb-8">
            Get a comprehensive SEO analysis of your website and discover specific 
            opportunities for improvement.
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
    </Layout>
  );
}