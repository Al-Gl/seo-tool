import React from 'react';
import { CalloutBox } from './CalloutBox';
import { CodeBlock } from './CodeBlock';
import { StatsCard } from './StatsCard';
import { ImageWithCaption } from './ImageWithCaption';
import { 
  CoreWebVitalsInfographic, 
  SEOAuditFlowchart 
} from './InfoGraphic';
import { 
  KeywordResearchProcess, 
  MobileFirstIndexing,
  SchemaTypesChart,
  PageSpeedWaterfall,
  InternalLinkingStructure
} from './SEOInfographics';

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

interface ContentNode {
  type: string;
  props: any;
  content?: string;
  children?: ContentNode[];
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  const parseContent = (htmlContent: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    let currentIndex = 0;

    // Enhanced regex patterns for different components
    const patterns = {
      callout: /\[callout:(\w+)(?:\s+title="([^"]*)")?\]([\s\S]*?)\[\/callout\]/gi,
      codeblock: /\[code(?:\s+lang="([^"]*)")?(?:\s+title="([^"]*)")?\]([\s\S]*?)\[\/code\]/gi,
      stats: /\[stats(?:\s+title="([^"]*)")?\s+layout="(grid|list)"?\]([\s\S]*?)\[\/stats\]/gi,
      image: /\[image\s+src="([^"]*)"(?:\s+alt="([^"]*)")?(?:\s+caption="([^"]*)")?(?:\s+credit="([^"]*)")?\s*\/?\]/gi,
      infographic: /\[infographic:(\w+)\]/gi,
      headings: /<h([2-6])([^>]*)>(.*?)<\/h[2-6]>/gi
    };

    // Process content with component replacements
    let processedContent = htmlContent;

    // Replace callouts
    processedContent = processedContent.replace(patterns.callout, (match, type, title, content) => {
      const id = `callout_${Math.random().toString(36).substr(2, 9)}`;
      return `<div data-component="callout" data-type="${type}" data-title="${title || ''}" data-id="${id}">${content}</div>`;
    });

    // Replace code blocks
    processedContent = processedContent.replace(patterns.codeblock, (match, lang, title, code) => {
      const id = `code_${Math.random().toString(36).substr(2, 9)}`;
      return `<div data-component="codeblock" data-lang="${lang || 'text'}" data-title="${title || ''}" data-id="${id}" data-code="${encodeURIComponent(code.trim())}"></div>`;
    });

    // Replace stats
    processedContent = processedContent.replace(patterns.stats, (match, title, layout, statsContent) => {
      const id = `stats_${Math.random().toString(36).substr(2, 9)}`;
      return `<div data-component="stats" data-title="${title || ''}" data-layout="${layout || 'grid'}" data-id="${id}" data-stats="${encodeURIComponent(statsContent)}"></div>`;
    });

    // Replace images
    processedContent = processedContent.replace(patterns.image, (match, src, alt, caption, credit) => {
      const id = `image_${Math.random().toString(36).substr(2, 9)}`;
      return `<div data-component="image" data-src="${src}" data-alt="${alt || ''}" data-caption="${caption || ''}" data-credit="${credit || ''}" data-id="${id}"></div>`;
    });

    // Replace infographics
    processedContent = processedContent.replace(patterns.infographic, (match, type) => {
      const id = `infographic_${Math.random().toString(36).substr(2, 9)}`;
      return `<div data-component="infographic" data-type="${type}" data-id="${id}"></div>`;
    });

    // Add IDs to headings for table of contents
    processedContent = processedContent.replace(patterns.headings, (match, level, attrs, content) => {
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      const id = cleanContent.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return `<h${level} id="${id}"${attrs}>${content}</h${level}>`;
    });

    // Parse the processed HTML and render components
    return parseHTMLToComponents(processedContent);
  };

  const parseHTMLToComponents = (html: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const processNode = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const component = element.getAttribute('data-component');

        // Handle custom components
        if (component) {
          return renderCustomComponent(element, index);
        }

        // Handle regular HTML elements
        const tagName = element.tagName.toLowerCase();
        const props: any = {
          key: index,
          className: getElementClassName(tagName)
        };

        // Add ID for headings
        if (element.id) {
          props.id = element.id;
        }

        const children = Array.from(element.childNodes)
          .map((child, childIndex) => processNode(child, childIndex))
          .filter(child => child !== null);

        return React.createElement(tagName, props, ...children);
      }

      return null;
    };

    Array.from(doc.body.childNodes).forEach((node, index) => {
      const component = processNode(node, index);
      if (component) {
        nodes.push(component);
      }
    });

    return nodes;
  };

  const renderCustomComponent = (element: Element, index: number): React.ReactNode => {
    const component = element.getAttribute('data-component');
    const id = element.getAttribute('data-id') || index.toString();

    switch (component) {
      case 'callout':
        const type = element.getAttribute('data-type') as any || 'info';
        const title = element.getAttribute('data-title') || undefined;
        return (
          <CalloutBox key={id} type={type} title={title}>
            <div dangerouslySetInnerHTML={{ __html: element.innerHTML }} />
          </CalloutBox>
        );

      case 'codeblock':
        const lang = element.getAttribute('data-lang') || 'text';
        const codeTitle = element.getAttribute('data-title') || undefined;
        const code = decodeURIComponent(element.getAttribute('data-code') || '');
        return (
          <CodeBlock 
            key={id}
            code={code}
            language={lang}
            title={codeTitle}
            showLineNumbers={code.split('\n').length > 5}
          />
        );

      case 'stats':
        const statsTitle = element.getAttribute('data-title') || undefined;
        const layout = element.getAttribute('data-layout') as 'grid' | 'list' || 'grid';
        const statsData = element.getAttribute('data-stats') || '';
        
        try {
          const stats = parseStatsData(decodeURIComponent(statsData));
          return (
            <StatsCard
              key={id}
              title={statsTitle}
              stats={stats}
              layout={layout}
            />
          );
        } catch (e) {
          return null;
        }

      case 'image':
        const src = element.getAttribute('data-src') || '';
        const alt = element.getAttribute('data-alt') || '';
        const caption = element.getAttribute('data-caption') || undefined;
        const credit = element.getAttribute('data-credit') || undefined;
        return (
          <ImageWithCaption
            key={id}
            src={src}
            alt={alt}
            caption={caption}
            credit={credit}
          />
        );

      case 'infographic':
        const infographicType = element.getAttribute('data-type') || '';
        return renderInfographic(infographicType, id);

      default:
        return null;
    }
  };

  const renderInfographic = (type: string, key: string): React.ReactNode => {
    const infographics: Record<string, React.ComponentType> = {
      'core-web-vitals': CoreWebVitalsInfographic,
      'seo-audit': SEOAuditFlowchart,
      'keyword-research': KeywordResearchProcess,
      'mobile-first': MobileFirstIndexing,
      'schema-types': SchemaTypesChart,
      'page-speed': PageSpeedWaterfall,
      'internal-linking': InternalLinkingStructure
    };

    const InfographicComponent = infographics[type];
    return InfographicComponent ? <InfographicComponent key={key} /> : null;
  };

  const parseStatsData = (statsContent: string) => {
    // Parse stats content in format: label:value:change or label:value
    const lines = statsContent.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        return {
          label: parts[0].trim(),
          value: parts[1].trim(),
          change: parts[2] ? parseFloat(parts[2]) : undefined,
          changeLabel: parts[3] ? parts[3].trim() : undefined
        };
      }
      return null;
    }).filter(Boolean);
  };

  const getElementClassName = (tagName: string): string => {
    const classMap: Record<string, string> = {
      p: 'text-gray-300 mb-4 leading-relaxed',
      h2: 'text-2xl font-bold text-white mt-12 mb-6 first:mt-0',
      h3: 'text-xl font-semibold text-white mt-8 mb-4',
      h4: 'text-lg font-semibold text-white mt-6 mb-3',
      h5: 'text-base font-semibold text-white mt-4 mb-2',
      h6: 'text-sm font-semibold text-white mt-4 mb-2',
      ul: 'list-disc list-inside text-gray-300 mb-4 space-y-1 ml-4',
      ol: 'list-decimal list-inside text-gray-300 mb-4 space-y-1 ml-4',
      li: 'text-gray-300',
      a: 'text-accent-400 hover:text-accent-300 transition-colors',
      strong: 'font-semibold text-white',
      em: 'italic text-gray-200',
      blockquote: 'border-l-4 border-accent-500 pl-6 py-2 my-6 italic text-gray-300 bg-space-800 bg-opacity-50 rounded-r',
      pre: 'bg-space-800 border border-space-700 rounded-lg p-4 overflow-x-auto mb-4',
      code: 'text-accent-400 bg-space-800 px-1.5 py-0.5 rounded text-sm font-mono'
    };

    return classMap[tagName] || '';
  };

  const renderedContent = parseContent(content);

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {renderedContent}
    </div>
  );
};