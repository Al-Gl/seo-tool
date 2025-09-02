import React from 'react';

interface PulsarRankLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl', 
  lg: 'text-2xl'
};

export function PulsarRankLogo({ 
  className = '', 
  size = 'md', 
  showText = true 
}: PulsarRankLogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo SVG */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle with gradient */}
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="url(#backgroundGradient)"
            className="drop-shadow-lg"
          />
          
          {/* Stylized P */}
          <path
            d="M16 12h8c4.418 0 8 3.582 8 8s-3.582 8-8 8h-4v8h-4V12zm4 4v8h4c2.209 0 4-1.791 4-4s-1.791-4-4-4h-4z"
            fill="white"
            className="drop-shadow-sm"
          />
          
          {/* Pulsing star */}
          <g className="animate-pulse">
            <path
              d="M36 16l-2 2-2-2 2-2 2 2z"
              fill="#38BDF8"
              className="animate-pulse"
            />
            <path
              d="M36 12v8m-4-4h8"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </g>
          
          {/* Signal waves */}
          <g opacity="0.6" className="animate-pulse">
            <path
              d="M40 20c0-2.5-1-5-3-7"
              stroke="#818CF8"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M42 24c0-4-2-8-6-11"
              stroke="#818CF8"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={`font-bold text-white ${textSizeClasses[size]}`}>
          Pulsar<span className="text-accent-400">Rank</span>
        </span>
      )}
    </div>
  );
}