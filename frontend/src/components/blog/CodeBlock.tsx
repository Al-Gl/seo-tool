import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  title,
  showLineNumbers = false,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={`my-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between bg-space-700 px-4 py-2 border-b border-space-600 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-gray-300">{title}</span>
            {language && (
              <span className="text-xs px-2 py-1 bg-space-600 text-gray-400 rounded">
                {language}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-accent-400"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
      
      <div className={`
        bg-space-800 border border-space-700 overflow-x-auto
        ${title ? 'rounded-b-lg' : 'rounded-lg'}
      `}>
        <pre className="p-4">
          <code className={`text-sm leading-relaxed ${getLanguageClass(language)}`}>
            {showLineNumbers ? (
              <table className="w-full">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="text-gray-500 text-right pr-4 select-none w-8">
                        {index + 1}
                      </td>
                      <td className="text-gray-300">
                        {line || '\n'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span className="text-gray-300">{code}</span>
            )}
          </code>
        </pre>
      </div>
      
      {!title && (
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="absolute top-2 right-2 text-gray-400 hover:text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
};

function getLanguageClass(language: string): string {
  // Basic syntax highlighting classes - could be enhanced with a proper syntax highlighter
  const languageClasses: Record<string, string> = {
    html: 'language-html',
    css: 'language-css',
    javascript: 'language-javascript',
    js: 'language-javascript',
    typescript: 'language-typescript',
    ts: 'language-typescript',
    json: 'language-json',
    bash: 'language-bash',
    shell: 'language-bash',
    sql: 'language-sql',
    python: 'language-python',
    php: 'language-php'
  };

  return languageClasses[language.toLowerCase()] || 'language-text';
}