"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import CarouselSlide from "./components/carousel/carousel-slide"
import CarouselControls from "./components/carousel/carousel-controls"
import CarouselIndicators from "./components/carousel/carousel-indicators"
import AddImageDialog from "./components/carousel/add-image-dialog"
import ReorderControls from "./components/carousel/reorder-controls"
import { CarouselLoadingProvider } from "./components/carousel/carousel-loading-provider"
import { ImageInterface } from "./lib/utils"

interface CarouselProps {
  images: ImageInterface[]
  setImages: React.Dispatch<React.SetStateAction<ImageInterface[]>>
  initialIndex: number
  onClose: () => void
}

export default function CustomCarousel({ images, setImages, initialIndex, onClose }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [autoplayInterval, setAutoplayInterval] = useState(5)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
  const [nextIndex, setNextIndex] = useState<number | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set up portal for mounting the carousel
  useEffect(() => {
    setPortalElement(document.body)
  }, [])

  // Memoize navigation functions to prevent unnecessary re-renders
  const goToNext = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    if (isTransitioning || images.length <= 1) return;

    const next = (currentIndex + 1) % images.length;
    setNextIndex(next);
    setDirection(1);
    setIsTransitioning(true);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(next);
      setNextIndex(null);
      setIsTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 300);
  }, [currentIndex, images.length, isTransitioning]);

  const goToPrevious = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    if (isTransitioning || images.length <= 1) return;

    const prev = (currentIndex - 1 + images.length) % images.length;
    setNextIndex(prev);
    setDirection(-1);
    setIsTransitioning(true);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(prev);
      setNextIndex(null);
      setIsTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 300);
  }, [currentIndex, images.length, isTransitioning]);

  // Set up autoplay interval
  useEffect(() => {
    if (isAutoplay && images.length > 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(goToNext, autoplayInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplayInterval, isAutoplay, images.length, goToNext]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrevious, goToNext]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (carouselRef.current && !carouselRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close handler with cleanup
  const handleClose = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    onClose();
  }, [onClose]);

  // Add image handler
  const handleAddImage = useCallback((title: string, description: string, imagePreview: string | null) => {
    if (title && imagePreview) {
      const newId = (Number.parseInt(images[images.length - 1]?.id || "0") + 1).toString();
      const newImageObj = {
        id: newId,
        url: imagePreview,
        title,
        description,
      };

      setImages(prevImages => [...prevImages, newImageObj]);
      setIsAddDialogOpen(false);
    }
  }, [images, setImages]);

  // Go to specific slide (for indicators)
  const goToSlide = useCallback((index: number) => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setIsTransitioning(false);
    setNextIndex(null);
    setCurrentIndex(index);
  }, []);

  // Toggle reorder mode
  const handleToggleReorderMode = useCallback(() => {
    setIsReorderMode(prev => !prev);
  }, []);

  // Handle reordering of images
  const handleReorder = useCallback((reorderedImages: ImageInterface[]) => {
    setImages(reorderedImages);
  }, [setImages]);

  // Preload logic - determine which images to preload
  const preloadImages = useCallback(() => {
    // Always preload the next and previous images for smoother navigation
    const imagesToPreload = [
      images[currentIndex],
      images[(currentIndex + 1) % images.length],
      images[(currentIndex - 1 + images.length) % images.length]
    ];

    // Preload the images by creating temporary Image objects
    imagesToPreload.forEach(image => {
      if (image && image.url) {
        const img = new Image();
        img.src = process.env.NEXT_PUBLIC_BACKEND_URL + image.url;
      }
    });
  }, [currentIndex, images]);

  // Call preload when current index changes
  useEffect(() => {
    if (images.length > 1) {
      preloadImages();
    }
  }, [currentIndex, preloadImages, images.length]);

  if (!portalElement) return null;

  return createPortal(
    <CarouselLoadingProvider images={images}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div ref={carouselRef} className="relative w-full max-w-5xl h-[90vh] flex flex-col">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Close carousel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Main carousel area */}
          <div className="relative flex-1 overflow-hidden">
            {/* Carousel Slides */}
            <div className="h-full w-full relative">
              {images.map((image, index) => {
                // Only render the current slide and the next slide during transition
                if (index !== currentIndex && index !== nextIndex) return null;
                
                return (
                  <CarouselSlide
                    key={image.id}
                    image={image}
                    isCurrentSlide={index === currentIndex}
                    isNextSlide={index === nextIndex}
                    direction={direction}
                    isTransitioning={isTransitioning}
                  />
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
              aria-label="Previous image"
              disabled={isTransitioning}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
              aria-label="Next image"
              disabled={isTransitioning}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Controls - extracted to its own component */}
          <CarouselControls
            isAutoplay={isAutoplay}
            setIsAutoplay={setIsAutoplay}
            autoplayInterval={autoplayInterval}
            setAutoplayInterval={setAutoplayInterval}
            onAddImage={() => setIsAddDialogOpen(true)}
            onToggleReorderMode={handleToggleReorderMode}
            isReorderMode={isReorderMode}
          />

          {/* Indicators - extracted to its own component */}
          <CarouselIndicators
            currentIndex={currentIndex}
            totalImages={images.length}
            onSelect={goToSlide}
          />

          {/* Add Image Dialog - extracted to its own component */}
          <AddImageDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onAddImage={handleAddImage}
          />

          {/* Reorder Controls - extracted to its own component */}
          <ReorderControls
            isOpen={isReorderMode}
            images={images}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </CarouselLoadingProvider>,
    portalElement
  );
}

