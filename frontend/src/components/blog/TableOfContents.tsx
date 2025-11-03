import React, { useEffect, useState } from 'react';
import { List, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  content, 
  className = '' 
}) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from content
    const headingRegex = /<h([2-4])[^>]*>(.*?)<\/h[2-4]>/gi;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const title = match[2].replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
      const id = title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
      
      items.push({
        id,
        title,
        level
      });
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Set up intersection observer for active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1
      }
    );

    // Observe all heading elements
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <Card className={`sticky top-24 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <List className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-white">Table of Contents</h3>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {tocItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                    hover:bg-space-700 hover:text-accent-400
                    ${activeId === item.id 
                      ? 'bg-accent-900 bg-opacity-30 text-accent-400 border-l-2 border-accent-400' 
                      : 'text-gray-300'
                    }
                    ${item.level === 3 ? 'ml-4' : ''}
                    ${item.level === 4 ? 'ml-8' : ''}
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {item.level > 2 && <ChevronRight className="w-3 h-3 opacity-60" />}
                    <span className={`text-sm ${item.level === 2 ? 'font-medium' : ''}`}>
                      {item.title}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};