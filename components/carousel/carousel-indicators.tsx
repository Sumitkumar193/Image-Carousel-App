import { SkipBack, SkipForward } from 'lucide-react';
import React, { useMemo } from 'react';

interface CarouselIndicatorsProps {
  currentIndex: number;
  totalImages: number;
  onSelect: (index: number) => void;
}

const CarouselIndicators = React.memo(function CarouselIndicators({
  currentIndex,
  totalImages,
  onSelect,
}: CarouselIndicatorsProps) {
  // Calculate which indicators to display (limit to 7)
  const visibleIndicators = useMemo(() => {
    const maxIndicators = 7;
    
    // If we have 7 or fewer images, show all indicators
    if (totalImages <= maxIndicators) {
      return Array.from({ length: totalImages }, (_, i) => i);
    }
    
    // Otherwise, calculate which 7 to show centered around current index
    let startIndex = Math.max(0, currentIndex - Math.floor(maxIndicators / 2));
    let endIndex = startIndex + maxIndicators - 1;
    
    // Adjust if we're too close to the end
    if (endIndex >= totalImages) {
      endIndex = totalImages - 1;
      startIndex = Math.max(0, endIndex - maxIndicators + 1);
    }
    
    return Array.from({ length: maxIndicators }, (_, i) => startIndex + i);
  }, [totalImages, currentIndex]);

  // Determine if we need to show ellipses
  const showStartEllipsis = visibleIndicators[0] > 0;
  const showEndEllipsis = visibleIndicators[visibleIndicators.length - 1] < totalImages - 1;

  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-20">
      {/* Start ellipsis if needed */}
      {showStartEllipsis && (
        <button 
          className="h-2 w-4 text-white flex items-center justify-center"
          onClick={() => onSelect(0)} // Jump to first slide
          aria-label="First slide"
        >
          <SkipBack color='gray' />
        </button>
      )}
      
      {/* Visible indicators */}
      {visibleIndicators.map((index) => (
        <button
          key={index}
          className={`h-2 rounded-full transition-all ${
            currentIndex === index ? "w-8 bg-white" : "w-2 bg-white/50"
          }`}
          onClick={() => onSelect(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
      
      {/* End ellipsis if needed */}
      {showEndEllipsis && (
        <button 
          className="h-2 w-4 text-white flex items-center justify-center"
          onClick={() => onSelect(totalImages - 1)} // Jump to last slide
          aria-label="Last slide"
        >
          <SkipForward color='gray' />
        </button>
      )}
    </div>
  );
});

export default CarouselIndicators;
