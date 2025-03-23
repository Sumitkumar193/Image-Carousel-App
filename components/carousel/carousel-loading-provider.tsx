"use client"

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';

interface Image {
  id: string;
  url: string;
  title: string;
  description: string;
}

interface CarouselLoadingContextType {
  loadedImages: Record<string, boolean>;
  markImageLoaded: (id: string) => void;
  isImageLoaded: (id: string) => boolean;
}

const CarouselLoadingContext = createContext<CarouselLoadingContextType | null>(null);

interface CarouselLoadingProviderProps {
  children: ReactNode;
  images: Image[];
}

export function CarouselLoadingProvider({ children, images }: CarouselLoadingProviderProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  const markImageLoaded = useCallback((id: string) => {
    setLoadedImages(prev => {
      // Only update if not already marked as loaded
      if (prev[id]) return prev;
      return {
        ...prev,
        [id]: true
      };
    });
  }, []);
  
  const isImageLoaded = useCallback((id: string) => {
    return !!loadedImages[id];
  }, [loadedImages]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    loadedImages,
    markImageLoaded,
    isImageLoaded
  }), [loadedImages, markImageLoaded, isImageLoaded]);

  return (
    <CarouselLoadingContext.Provider value={contextValue}>
      {children}
    </CarouselLoadingContext.Provider>
  );
}

export function useCarouselLoading() {
  const context = useContext(CarouselLoadingContext);
  if (!context) {
    throw new Error('useCarouselLoading must be used within a CarouselLoadingProvider');
  }
  return context;
}
