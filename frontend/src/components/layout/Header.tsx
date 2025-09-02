import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PulsarRankLogo } from '@/components/ui/PulsarRankLogo';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className={`bg-space-900 border-b border-space-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <PulsarRankLogo size="sm" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-accent-400 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="/blog" 
              className="text-gray-300 hover:text-accent-400 transition-colors duration-200"
            >
              Blog
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-300 hover:text-accent-400 transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-accent-400 transition-colors duration-200"
            >
              About
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              size="sm" 
              className="bg-accent-500 hover:bg-accent-600 text-white"
            >
              Start Analysis
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-space-700 py-4 animate-fade-in">
            <nav className="space-y-4">
              <Link 
                href="/" 
                className="block text-gray-300 hover:text-accent-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/blog" 
                className="block text-gray-300 hover:text-accent-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/pricing" 
                className="block text-gray-300 hover:text-accent-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className="block text-gray-300 hover:text-accent-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-space-700 space-y-2">
                <Button 
                  size="sm" 
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white"
                >
                  Start Analysis
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}