import React, { useState, useEffect } from 'react';

interface ReadingProgressProps {
  className?: string;
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({ 
  className = '' 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    const throttledUpdate = throttle(updateProgress, 16); // ~60fps
    window.addEventListener('scroll', throttledUpdate);
    updateProgress(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', throttledUpdate);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 w-full h-1 bg-space-800 z-50 ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-accent-500 to-purple-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}