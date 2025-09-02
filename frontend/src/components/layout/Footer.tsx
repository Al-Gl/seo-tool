import React from 'react';
import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { PulsarRankLogo } from '@/components/ui/PulsarRankLogo';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-space-950 text-white border-t border-space-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <PulsarRankLogo size="sm" showText={true} />
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Pinpoint your SEO weaknesses with stellar accuracy. Professional analysis 
              powered by AI to help you dominate search rankings.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-400 transition-colors duration-200"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-400 transition-colors duration-200"
                aria-label="View our GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent-400 transition-colors duration-200"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:contact@pulsarrank.com"
                className="text-gray-400 hover:text-accent-400 transition-colors duration-200"
                aria-label="Send us an email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  SEO Analysis
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors duration-200">
                  SEO Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors duration-200">
                  SEO Blog
                </Link>
              </li>
              <li>
                <Link href="/blog/beginners-guide-keyword-research" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Keyword Research Guide
                </Link>
              </li>
              <li>
                <Link href="/blog/understanding-core-web-vitals" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Core Web Vitals
                </Link>
              </li>
              <li>
                <Link href="/blog/introduction-technical-seo" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Technical SEO
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  About PulsarRank
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:contact@pulsarrank.com" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-space-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {currentYear} PulsarRank. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}