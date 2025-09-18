import React from 'react';
import Image from 'next/image';

interface PulsarRankLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeMap = {
  sm: { width: 32, height: 32, containerClass: 'w-8 h-8' },
  md: { width: 48, height: 48, containerClass: 'w-12 h-12' },
  lg: { width: 64, height: 64, containerClass: 'w-16 h-16' }
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
  const sizeConfig = sizeMap[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo PNG */}
      <div className={`${sizeConfig.containerClass} relative`}>
        <Image
          src="/logo.png"
          alt="PulsarRank Logo"
          width={sizeConfig.width}
          height={sizeConfig.height}
          className="object-contain drop-shadow-lg"
          priority={size === 'md' || size === 'lg'} // Prioritize loading for larger sizes
          quality={90}
        />
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