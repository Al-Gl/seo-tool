import React from 'react';
import Link from 'next/link';
import { User, Mail, Linkedin, ArrowRight, Award, TrendingUp, Users, Clock } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const achievements = [
  {
    icon: TrendingUp,
    title: '10+ Years Experience',
    description: 'A decade of hands-on SEO expertise working with diverse businesses and industries.'
  },
  {
    icon: Users,
    title: 'Agency & In-House',
    description: 'Extensive experience both at SEO agencies and large corporate in-house teams.'
  },
  {
    icon: Award,
    title: 'Proven Results',
    description: 'Helped numerous websites achieve significant improvements in search rankings and organic traffic.'
  },
  {
    icon: Clock,
    title: 'Cutting-Edge Knowledge',
    description: 'Stays current with the latest SEO trends, algorithm updates, and industry best practices.'
  }
];

const skills = [
  'Technical SEO Audits',
  'Keyword Research & Strategy',
  'On-Page Optimization',
  'Content SEO',
  'Link Building',
  'Local SEO',
  'SEO Analytics & Reporting',
  'Core Web Vitals Optimization',
  'Schema Markup Implementation',
  'Mobile SEO',
  'International SEO',
  'E-commerce SEO'
];

export default function AboutPage() {
  return (
    <Layout
      title="About Aldin Glavas - SEO Expert & PulsarRank Founder"
      description="Learn about Aldin Glavas, an SEO expert with 10 years of experience at agencies and in-house corporate teams. Founder of PulsarRank SEO analysis platform."
    >
      {/* Hero Section */}
      <section className="bg-space-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-accent-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About the <span className="text-gradient-pulsar">Author</span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl text-gray-300 mb-4">
              Aldin Glavas
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              SEO Expert with 10 years of experience working both at agencies and for large 
              in-house corporate teams. Founder of PulsarRank, helping businesses dominate 
              search rankings with stellar accuracy.
            </p>

            <div className="flex justify-center space-x-4">
              <a 
                href="mailto:aldin@pulsarrank.com"
                className="inline-flex items-center px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Mail className="w-5 h-5 mr-2" />
                Get In Touch
              </a>
              
              <a 
                href="https://linkedin.com/in/aldinglavas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-transparent border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5 mr-2" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 bg-space-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              A Decade of SEO Excellence
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              My journey in SEO spans over 10 years, working with diverse businesses 
              to improve their online visibility and drive sustainable organic growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center bg-space-700 border-space-600 hover:border-accent-600 transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-900 bg-opacity-30 rounded-full mb-6 border border-accent-800">
                    <achievement.icon className="w-8 h-8 text-accent-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-300">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Professional Background */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Professional Background</h3>
              <div className="space-y-6 text-gray-300">
                <p>
                  With over a decade of experience in search engine optimization, I've had the 
                  privilege of working across diverse environments - from fast-paced digital 
                  agencies to large corporate in-house teams.
                </p>
                
                <p>
                  This unique perspective has given me insights into SEO strategies that work 
                  at different scales, from small local businesses to enterprise-level 
                  organizations with complex technical requirements.
                </p>
                
                <p>
                  Throughout my career, I've witnessed the evolution of search algorithms, 
                  from the early days of keyword density optimization to today's sophisticated 
                  understanding of user intent and content quality.
                </p>
                
                <p>
                  This experience led me to create PulsarRank - a platform that combines 
                  cutting-edge AI technology with proven SEO methodologies to deliver 
                  actionable insights that actually move the needle.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Core Expertise</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 bg-space-700 rounded-lg border border-space-600"
                  >
                    <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-space-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              My SEO Philosophy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-space-800 border-space-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">User-First Approach</h3>
                <p className="text-gray-300">
                  Great SEO starts with understanding user intent. I believe in creating 
                  content and experiences that genuinely serve the audience, not just 
                  search engines.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-space-800 border-space-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Data-Driven Decisions</h3>
                <p className="text-gray-300">
                  Every SEO strategy should be backed by solid data. I rely on comprehensive 
                  analysis and testing to guide recommendations and measure success.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-space-800 border-space-700">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-4">Sustainable Growth</h3>
                <p className="text-gray-300">
                  I focus on white-hat SEO techniques that build long-term authority and 
                  resilience against algorithm changes, ensuring lasting results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PulsarRank Section */}
      <section className="py-16 bg-gradient-to-br from-accent-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="hero-glow absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Why I Built PulsarRank
          </h2>
          
          <p className="text-xl text-white text-opacity-90 mb-8 max-w-3xl mx-auto">
            After years of using various SEO tools, I noticed a gap - most tools either 
            provided too much technical jargon or oversimplified complex issues. 
            PulsarRank bridges this gap with AI-powered analysis that's both comprehensive 
            and accessible.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Actionable Insights</h3>
              <p className="text-white text-opacity-80 text-sm">
                Every recommendation comes with clear explanations and step-by-step 
                implementation guidance.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">AI-Powered Analysis</h3>
              <p className="text-white text-opacity-80 text-sm">
                Advanced algorithms analyze your website like an experienced SEO 
                consultant would, but in seconds.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Beginner-Friendly</h3>
              <p className="text-white text-opacity-80 text-sm">
                Complex SEO concepts explained in simple terms that anyone can 
                understand and implement.
              </p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-4 bg-white text-accent-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors duration-200"
          >
            Try PulsarRank SEO Analyzer
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-space-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Let's Connect
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Have questions about SEO or want to discuss how PulsarRank can help your 
            business? I'd love to hear from you.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a 
              href="mailto:aldin@pulsarrank.com"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <Mail className="w-5 h-5 mr-3" />
              aldin@pulsarrank.com
            </a>
            
            <a 
              href="https://linkedin.com/in/aldinglavas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <Linkedin className="w-5 h-5 mr-3" />
              Connect on LinkedIn
            </a>
          </div>
          
          <div className="mt-12 pt-8 border-t border-space-700">
            <p className="text-gray-400">
              Ready to discover your website's SEO opportunities?
            </p>
            <Link 
              href="/"
              className="inline-flex items-center text-accent-400 hover:text-accent-300 font-medium mt-2"
            >
              Start your free SEO analysis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}