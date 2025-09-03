import React, { useState } from 'react';
import { ImageIcon, ZoomIn } from 'lucide-react';

interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  className?: string;
  zoomable?: boolean;
}

export const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({
  src,
  alt,
  caption,
  credit,
  width,
  height,
  className = '',
  zoomable = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  const toggleZoom = () => {
    if (zoomable) {
      setIsZoomed(!isZoomed);
    }
  };

  if (hasError) {
    return (
      <div className={`my-8 ${className}`}>
        <div className="flex items-center justify-center bg-space-800 border-2 border-dashed border-space-600 rounded-lg p-12">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Image could not be loaded</p>
            <p className="text-sm text-gray-500 mt-2">{src}</p>
          </div>
        </div>
        {(caption || credit) && (
          <div className="mt-3 text-center">
            {caption && (
              <p className="text-sm text-gray-300 italic">{caption}</p>
            )}
            {credit && (
              <p className="text-xs text-gray-500 mt-1">Credit: {credit}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <figure className={`my-8 ${className}`}>
        <div className={`relative overflow-hidden rounded-lg border border-space-700 ${zoomable ? 'cursor-zoom-in' : ''}`}>
          {!isLoaded && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-space-800 animate-pulse"
              style={{ aspectRatio: width && height ? `${width}/${height}` : '16/9' }}
            >
              <ImageIcon className="w-8 h-8 text-gray-600" />
            </div>
          )}
          
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={toggleZoom}
            className={`
              w-full h-auto transition-all duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
              ${zoomable ? 'hover:scale-105' : ''}
            `}
          />
          
          {zoomable && isLoaded && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        {(caption || credit) && (
          <figcaption className="mt-3 text-center">
            {caption && (
              <p className="text-sm text-gray-300 italic">{caption}</p>
            )}
            {credit && (
              <p className="text-xs text-gray-500 mt-1">Credit: {credit}</p>
            )}
          </figcaption>
        )}
      </figure>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={toggleZoom}
        >
          <div className="max-w-[90vw] max-h-[90vh] relative">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={toggleZoom}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};