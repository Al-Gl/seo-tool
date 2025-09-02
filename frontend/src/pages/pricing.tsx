import React from 'react';
import Link from 'next/link';
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<any>;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    description: 'Perfect for trying out PulsarRank and getting started with SEO analysis.',
    icon: Star,
    buttonText: 'Start Free Analysis',
    buttonVariant: 'secondary',
    features: [
      '5 website analyses per month',
      'Basic on-page SEO checks',
      'Meta tags analysis',
      'Page speed insights',
      'Mobile-friendliness test',
      'Basic recommendations',
      'Email support'
    ]
  },
  {
    name: 'Basic',
    price: '€5',
    period: 'per month',
    description: 'Great for small businesses and individual website owners who need regular SEO monitoring.',
    icon: Zap,
    buttonText: 'Start Basic Plan',
    buttonVariant: 'primary',
    highlighted: true,
    features: [
      '50 website analyses per month',
      'Everything in Free plan',
      'Advanced technical SEO audit',
      'Keyword opportunity analysis',
      'Performance metrics tracking',
      'Image optimization suggestions',
      'Internal linking recommendations',
      'Priority email support',
      'SEO score history tracking'
    ]
  },
  {
    name: 'Full',
    price: '€14',
    period: 'per month',
    description: 'Perfect for agencies, consultants, and businesses serious about dominating search rankings.',
    icon: Crown,
    buttonText: 'Start Full Plan',
    buttonVariant: 'primary',
    features: [
      'Unlimited website analyses',
      'Everything in Basic plan',
      'AI-powered content recommendations',
      'Competitor analysis insights',
      'Advanced Core Web Vitals optimization',
      'Schema markup suggestions',
      'Custom SEO reports (PDF export)',
      'White-label reporting',
      'API access for integrations',
      'Priority phone & email support',
      'Custom SEO strategy sessions'
    ]
  }
];

const faqs = [
  {
    question: 'How accurate are PulsarRank\'s SEO analyses?',
    answer: 'PulsarRank uses advanced AI algorithms combined with proven SEO best practices to provide highly accurate analyses. Our recommendations are based on current Google guidelines and industry standards, with over 90% accuracy in identifying critical SEO issues.'
  },
  {
    question: 'Can I upgrade or downgrade my plan at any time?',
    answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will take effect at the start of your next billing cycle. You\'ll always have access to your current plan\'s features until the billing period ends.'
  },
  {
    question: 'What types of websites can PulsarRank analyze?',
    answer: 'PulsarRank can analyze any publicly accessible website, including e-commerce sites, blogs, corporate websites, landing pages, and more. Our AI understands different content management systems and website structures.'
  },
  {
    question: 'How often should I run SEO analyses on my website?',
    answer: 'We recommend running analyses weekly for active websites or after major content updates. For stable websites, monthly analyses are typically sufficient to monitor performance and catch any emerging issues.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied with PulsarRank within the first 30 days, contact us for a full refund.'
  },
  {
    question: 'Is there a setup fee or long-term contract?',
    answer: 'No setup fees and no long-term contracts required. All plans are month-to-month, and you can cancel at any time. You only pay for the months you use the service.'
  }
];

export default function PricingPage() {
  return (
    <Layout
      title="PulsarRank Pricing - Professional SEO Analysis Plans"
      description="Choose the perfect PulsarRank plan for your SEO needs. From free analysis to unlimited professional reports. Start improving your search rankings today."
    >
      {/* Hero Section */}
      <section className="bg-space-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your <span className="text-gradient-pulsar">SEO Success</span> Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            From free analysis to unlimited professional reports, find the perfect plan 
            to dominate search rankings with stellar accuracy.
          </p>
          <div className="inline-flex items-center space-x-2 text-accent-400">
            <Check className="w-5 h-5" />
            <span>30-day money-back guarantee</span>
            <span className="text-gray-600">•</span>
            <span>No setup fees</span>
            <span className="text-gray-600">•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 bg-space-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  tier.highlighted 
                    ? 'bg-gradient-to-b from-accent-900 to-space-800 border-accent-500 scale-105 shadow-2xl' 
                    : 'bg-space-800 border-space-700'
                } hover:shadow-xl transition-all duration-300`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-900 bg-opacity-30 rounded-full mb-4 border border-accent-800">
                      <tier.icon className="w-8 h-8 text-accent-400" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-gray-400 ml-2">/{tier.period}</span>
                    </div>
                    
                    <p className="text-gray-300 text-sm">{tier.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-accent-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/" className="block">
                    <Button 
                      className={`w-full py-3 font-semibold ${
                        tier.buttonVariant === 'primary'
                          ? 'bg-accent-500 hover:bg-accent-600 text-white'
                          : 'bg-transparent border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white'
                      }`}
                    >
                      {tier.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-space-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              What Makes PulsarRank Special?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered SEO analysis goes beyond basic checks to provide actionable 
              insights that actually improve your search rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-space-700 border-space-600">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent-900 bg-opacity-30 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Analysis</h3>
                <p className="text-gray-300">
                  Advanced machine learning algorithms analyze your website like an experienced 
                  SEO consultant, identifying issues and opportunities in seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-space-700 border-space-600">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent-900 bg-opacity-30 rounded-lg flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Actionable Recommendations</h3>
                <p className="text-gray-300">
                  Every issue comes with specific, step-by-step instructions on how to fix it. 
                  No technical jargon - just clear guidance you can implement immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-space-700 border-space-600">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent-900 bg-opacity-30 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Expert-Level Insights</h3>
                <p className="text-gray-300">
                  Built by an SEO expert with 10 years of experience, PulsarRank incorporates 
                  proven strategies from agency and enterprise-level campaigns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-space-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Have questions? We've got answers. Can't find what you're looking for? 
              <a href="mailto:aldin@pulsarrank.com" className="text-accent-400 hover:text-accent-300 ml-1">
                Contact us
              </a>.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-space-800 border-space-700">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-white mb-4">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-accent-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="hero-glow absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Dominate Search Rankings?
          </h2>
          
          <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using PulsarRank to improve their SEO and 
            drive more organic traffic. Start with our free plan today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-accent-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors duration-200"
            >
              Start Free Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <Link 
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-accent-600 font-semibold rounded-lg transition-colors duration-200"
            >
              Learn About the Founder
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-white border-opacity-20">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-white text-opacity-80">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>No setup fees or contracts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}