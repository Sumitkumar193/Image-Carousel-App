"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * A component that shows a blur placeholder while the image loads
 * and smoothly transitions to the full image
 */
export function ImageWithPlaceholder({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  className,
  objectFit = 'cover',
}: ImageWithPlaceholderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Use useRef to keep track of the image src to prevent duplicate requests
  const prevSrcRef = useRef(src);
  
  // Reset loading state when the image source changes
  useEffect(() => {
    if (prevSrcRef.current !== src) {
      setIsLoaded(false);
      setError(false);
      prevSrcRef.current = src;
    }
  }, [src]);

  // Memoize handlers to prevent recreating functions on every render
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  // Use a static blurDataURL instead of generating it on each render
  const staticBlurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJc4yWCqwAAAABJRU5ErkJggg==";

  return (
    <div className={cn(
      'relative overflow-hidden',
      fill ? 'w-full h-full' : '',
      className
    )}>
      {/* Show placeholder only when image is not loaded */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Main image - note the unoptimized prop for user-uploaded images */}
      <Image
        src={error ? "/placeholder.svg" : src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onLoadingComplete={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL={staticBlurDataURL}
        // Add unoptimized for data URLs to prevent optimization attempts
        unoptimized={src.startsWith('data:')}
        className={cn(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down'
        )}
      />
    </div>
  );
}
