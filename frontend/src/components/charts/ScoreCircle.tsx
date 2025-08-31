import React from 'react';
import { getScoreColor } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { radius: 30, strokeWidth: 4, fontSize: 'text-sm' },
  md: { radius: 40, strokeWidth: 6, fontSize: 'text-base' },
  lg: { radius: 50, strokeWidth: 8, fontSize: 'text-lg' },
  xl: { radius: 60, strokeWidth: 10, fontSize: 'text-xl' },
};

export function ScoreCircle({ 
  score, 
  maxScore = 100, 
  size = 'lg',
  showLabel = true,
  label,
  className = ''
}: ScoreCircleProps) {
  const { radius, strokeWidth, fontSize } = sizeConfig[size];
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const percentage = (normalizedScore / maxScore) * 100;
  
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const scoreColor = getScoreColor(percentage);
  
  const getStrokeColor = () => {
    if (percentage >= 80) return '#22c55e'; // success-500
    if (percentage >= 60) return '#f59e0b'; // warning-500
    return '#ef4444'; // danger-500
  };

  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className={`inline-flex flex-col items-center space-y-2 ${className}`}>
      <div className="relative">
        <svg 
          width={svgSize} 
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-25"
          />
          
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              animation: 'scoreCircleAnimation 1.5s ease-out forwards'
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold ${fontSize} ${scoreColor}`}>
              {Math.round(normalizedScore)}
            </div>
            {maxScore !== 100 && (
              <div className="text-xs text-gray-500 -mt-1">
                /{maxScore}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showLabel && (
        <div className="text-center">
          {label && (
            <div className="text-sm font-medium text-gray-900">
              {label}
            </div>
          )}
          <div className="text-xs text-gray-500">
            SEO Score
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scoreCircleAnimation {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${strokeDashoffset};
          }
        }
      `}</style>
    </div>
  );
}