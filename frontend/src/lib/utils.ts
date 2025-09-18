import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function for combining class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format URL to ensure it has protocol
 */
export function formatUrl(url: string): string {
  if (!url) return '';
  
  // Remove any whitespace
  url = url.trim();
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const formattedUrl = formatUrl(url);
    new URL(formattedUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format time duration in human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

/**
 * Format date in relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return past.toLocaleDateString();
  }
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Calculate score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-warning-600';
  return 'text-danger-600';
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: 'critical' | 'warning' | 'suggestion'): string {
  switch (severity) {
    case 'critical':
      return 'text-danger-600 bg-danger-50 border-danger-200';
    case 'warning':
      return 'text-warning-600 bg-warning-50 border-warning-200';
    case 'suggestion':
      return 'text-primary-600 bg-primary-50 border-primary-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'text-danger-600 bg-danger-50';
    case 'medium':
      return 'text-warning-600 bg-warning-50';
    case 'low':
      return 'text-success-600 bg-success-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    return new URL(formatUrl(url)).hostname;
  } catch {
    return url;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}

/**
 * Create URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// AI Summary Text Parsing Utilities

export interface ParsedSummarySection {
  type: 'header' | 'paragraph' | 'list' | 'metric' | 'action';
  content: string;
  icon?: string;
  level?: number;
  items?: string[];
}

export interface StructuredSummary {
  sections: ParsedSummarySection[];
  hasStructure: boolean;
}

/**
 * Parse AI summary text into structured sections
 */
export function parseAISummary(text: string): StructuredSummary {
  if (!text || typeof text !== 'string') {
    return { sections: [], hasStructure: false };
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const sections: ParsedSummarySection[] = [];
  let hasStructure = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers with emoji or special markers
    if (isHeaderLine(line)) {
      sections.push({
        type: 'header',
        content: line,
        icon: extractIcon(line),
        level: getHeaderLevel(line)
      });
      hasStructure = true;
      continue;
    }

    // Detect bullet points or numbered lists
    if (isBulletPoint(line)) {
      const listItems = [line];
      let j = i + 1;

      // Collect consecutive list items
      while (j < lines.length && isBulletPoint(lines[j])) {
        listItems.push(lines[j]);
        j++;
      }

      sections.push({
        type: 'list',
        content: 'List of recommendations',
        items: listItems.map(item => cleanListItem(item))
      });

      i = j - 1; // Skip processed items
      hasStructure = true;
      continue;
    }

    // Detect metrics or performance data
    if (isMetricLine(line)) {
      sections.push({
        type: 'metric',
        content: line,
        icon: '📊'
      });
      hasStructure = true;
      continue;
    }

    // Detect action items
    if (isActionItem(line)) {
      sections.push({
        type: 'action',
        content: line,
        icon: '⚡'
      });
      hasStructure = true;
      continue;
    }

    // Regular paragraph
    sections.push({
      type: 'paragraph',
      content: line
    });
  }

  // If no structure detected, treat entire text as single paragraph
  if (!hasStructure && text.length > 0) {
    sections.push({
      type: 'paragraph',
      content: text
    });
  }

  return { sections, hasStructure };
}

/**
 * Check if line is a header
 */
function isHeaderLine(line: string): boolean {
  // Lines starting with emoji or special characters, or all caps
  const headerPatterns = [
    /^[🎯✅⚠️🔧📊💡🎨🚀📈💪🎪🎺📝✨🔍]/, // Emoji headers
    /^#+\s/, // Markdown headers
    /^[A-Z][A-Z\s]+:/, // ALL CAPS headers with colon
    /^(KEY|MAIN|IMPORTANT|CRITICAL|SUMMARY|FINDINGS|ISSUES|RECOMMENDATIONS|ACTION|PRIORITY)/i
  ];

  return headerPatterns.some(pattern => pattern.test(line));
}

/**
 * Extract icon from header line
 */
function extractIcon(line: string): string | undefined {
  const emojiMatch = line.match(/^([🎯✅⚠️🔧📊💡🎨🚀📈💪🎪🎺📝✨🔍])/);
  return emojiMatch ? emojiMatch[1] : undefined;
}

/**
 * Get header level (1-3)
 */
function getHeaderLevel(line: string): number {
  if (line.match(/^#+\s/)) {
    const hashes = line.match(/^(#+)/)?.[1].length || 1;
    return Math.min(hashes, 3);
  }

  if (line.match(/^[A-Z][A-Z\s]+:/)) {
    return 1; // Major header
  }

  return 2; // Default level
}

/**
 * Check if line is a bullet point or numbered list item
 */
function isBulletPoint(line: string): boolean {
  const bulletPatterns = [
    /^[-•*]\s/, // Bullet points
    /^\d+\.\s/, // Numbered lists
    /^[a-zA-Z]\.\s/, // Letter lists
    /^[-•*→]\s/, // Arrow lists
  ];

  return bulletPatterns.some(pattern => pattern.test(line));
}

/**
 * Clean list item by removing bullet markers
 */
function cleanListItem(line: string): string {
  return line.replace(/^[-•*→\d+a-zA-Z\.]\s*/, '').trim();
}

/**
 * Check if line contains metrics or performance data
 */
function isMetricLine(line: string): boolean {
  const metricPatterns = [
    /\d+(\.\d+)?(ms|s|%|\/100|px|kb|mb)/i, // Performance metrics
    /score:\s*\d+/i, // Scores
    /\d+(\.\d+)?\s*(seconds?|minutes?|hours?)/i, // Time measurements
    /(load time|response time|speed|performance|score)/i
  ];

  return metricPatterns.some(pattern => pattern.test(line));
}

/**
 * Check if line is an action item
 */
function isActionItem(line: string): boolean {
  const actionPatterns = [
    /^(fix|optimize|improve|add|remove|update|implement|consider|review)/i,
    /(should|must|need to|recommended|suggested)/i,
    /^(action|todo|task):/i
  ];

  return actionPatterns.some(pattern => pattern.test(line));
}

/**
 * Format structured summary for display
 */
export function formatSummaryForDisplay(structuredSummary: StructuredSummary): React.ReactNode[] {
  // This will be used in the React component to render structured content
  return structuredSummary.sections.map((section, index) => ({
    id: `section-${index}`,
    type: section.type,
    content: section.content,
    icon: section.icon,
    level: section.level,
    items: section.items
  }));
}

/**
 * Get human-readable language name from language code
 */
export function getLanguageName(languageCode: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'da': 'Danish',
    'de': 'German',
    'fr': 'French',
    'es': 'Spanish',
    'it': 'Italian',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'is': 'Icelandic',
    'pt': 'Portuguese',
    'pl': 'Polish',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean'
  };
  return languages[languageCode] || languageCode.toUpperCase();
}