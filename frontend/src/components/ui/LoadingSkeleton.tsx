import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function LoadingSkeleton({ 
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'rounded-xl',
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: '1rem' };
      case 'circular':
        return { width: '2.5rem', height: '2.5rem' };
      case 'card':
        return { width: '100%', height: '12rem' };
      default:
        return { width: '100%', height: '2rem' };
    }
  };

  const defaultDimensions = getDefaultDimensions();
  const style = {
    width: width || defaultDimensions.width,
    height: height || defaultDimensions.height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variants[variant])}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width, // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={style}
    />
  );
}

// Pre-built skeleton components
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" width="60%" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      </div>
      <LoadingSkeleton variant="text" lines={3} />
    </div>
  );
}

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <LoadingSkeleton variant="text" width={200} height={32} />
          <LoadingSkeleton variant="text" width={150} height={16} />
        </div>
        <div className="flex space-x-2">
          <LoadingSkeleton variant="rectangular" width={100} height={36} />
          <LoadingSkeleton variant="rectangular" width={120} height={36} />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="p-6 bg-white rounded-xl border">
            <div className="flex items-center justify-between mb-4">
              <LoadingSkeleton variant="text" width={80} />
              <LoadingSkeleton variant="circular" width={24} height={24} />
            </div>
            <div className="space-y-3">
              <LoadingSkeleton variant="text" width={60} />
              <LoadingSkeleton variant="text" width={40} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="p-6 bg-white rounded-xl border">
        <LoadingSkeleton variant="text" width={200} height={24} className="mb-4" />
        <LoadingSkeleton variant="rectangular" width="100%" height={300} />
      </div>

      {/* Issues list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="p-6 bg-white rounded-xl border">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <LoadingSkeleton variant="text" width={250} />
                  <LoadingSkeleton variant="rectangular" width={80} height={24} />
                  <LoadingSkeleton variant="rectangular" width={60} height={24} />
                </div>
                <LoadingSkeleton variant="text" lines={2} />
              </div>
              <LoadingSkeleton variant="text" width={40} />
            </div>
            <LoadingSkeleton variant="rectangular" width="100%" height={60} />
          </div>
        ))}
      </div>
    </div>
  );
}