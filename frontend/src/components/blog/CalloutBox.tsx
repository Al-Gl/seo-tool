import React from 'react';
import { AlertCircle, CheckCircle, Info, Lightbulb, TrendingUp, Zap } from 'lucide-react';

type CalloutType = 'info' | 'tip' | 'warning' | 'success' | 'insight' | 'important';

interface CalloutBoxProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    bgClass: 'bg-primary-900 bg-opacity-30 border-primary-500',
    iconClass: 'text-primary-400',
    titleClass: 'text-primary-300',
    contentClass: 'text-gray-300'
  },
  tip: {
    icon: Lightbulb,
    bgClass: 'bg-yellow-900 bg-opacity-30 border-yellow-500',
    iconClass: 'text-yellow-400',
    titleClass: 'text-yellow-300',
    contentClass: 'text-gray-300'
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-orange-900 bg-opacity-30 border-orange-500',
    iconClass: 'text-orange-400',
    titleClass: 'text-orange-300',
    contentClass: 'text-gray-300'
  },
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-900 bg-opacity-30 border-green-500',
    iconClass: 'text-green-400',
    titleClass: 'text-green-300',
    contentClass: 'text-gray-300'
  },
  insight: {
    icon: TrendingUp,
    bgClass: 'bg-purple-900 bg-opacity-30 border-purple-500',
    iconClass: 'text-purple-400',
    titleClass: 'text-purple-300',
    contentClass: 'text-gray-300'
  },
  important: {
    icon: Zap,
    bgClass: 'bg-accent-900 bg-opacity-30 border-accent-500',
    iconClass: 'text-accent-400',
    titleClass: 'text-accent-300',
    contentClass: 'text-gray-300'
  }
};

export const CalloutBox: React.FC<CalloutBoxProps> = ({ 
  type, 
  title, 
  children, 
  className = '' 
}) => {
  const config = calloutConfig[type];
  const IconComponent = config.icon;
  
  const defaultTitles = {
    info: 'Good to Know',
    tip: 'Pro Tip',
    warning: 'Important',
    success: 'Best Practice',
    insight: 'Key Insight',
    important: 'Essential'
  };

  const displayTitle = title || defaultTitles[type];

  return (
    <div className={`
      border-l-4 rounded-r-lg p-6 my-6
      ${config.bgClass}
      ${className}
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className={`w-5 h-5 ${config.iconClass}`} />
        </div>
        <div className="flex-1">
          {displayTitle && (
            <h4 className={`font-semibold mb-2 ${config.titleClass}`}>
              {displayTitle}
            </h4>
          )}
          <div className={`prose prose-sm max-w-none ${config.contentClass}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};