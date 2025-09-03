import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  unit?: string;
}

interface StatsCardProps {
  title?: string;
  stats: StatItem[];
  layout?: 'grid' | 'list';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  stats,
  layout = 'grid',
  className = ''
}) => {
  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return 'text-gray-400';
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatChange = (change?: number) => {
    if (!change) return '';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <Card className={`my-6 ${className}`}>
      <CardContent className="p-6">
        {title && (
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}
        
        <div className={`
          ${layout === 'grid' 
            ? `grid gap-4 ${stats.length === 2 ? 'grid-cols-2' : stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`
            : 'space-y-4'
          }
        `}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-lg border border-space-600 bg-space-700 bg-opacity-50
                ${layout === 'list' ? 'flex items-center justify-between' : 'text-center'}
              `}
            >
              <div className={layout === 'list' ? 'flex-1' : ''}>
                <div className={`text-sm text-gray-400 mb-1 ${layout === 'list' ? 'text-left' : ''}`}>
                  {stat.label}
                </div>
                <div className={`text-2xl font-bold text-white ${layout === 'list' ? 'text-left' : ''}`}>
                  {stat.value}
                  {stat.unit && (
                    <span className="text-lg text-gray-400 ml-1">{stat.unit}</span>
                  )}
                </div>
              </div>
              
              {(stat.change !== undefined || stat.changeLabel) && (
                <div className={`
                  flex items-center space-x-1 mt-2
                  ${layout === 'list' ? 'justify-end' : 'justify-center'}
                `}>
                  {getTrendIcon(stat.change)}
                  <span className={`text-sm ${getTrendColor(stat.change)}`}>
                    {stat.changeLabel || formatChange(stat.change)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};