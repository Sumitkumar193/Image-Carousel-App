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
  // Use useMemo to avoid recalculating indicators array on each render
  const indicators = useMemo(() => {
    return Array.from({ length: totalImages }, (_, i) => i);
  }, [totalImages]);

  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-20">
      {indicators.map((index) => (
        <button
          key={index}
          className={`h-2 rounded-full transition-all ${
            currentIndex === index ? "w-8 bg-white" : "w-2 bg-white/50"
          }`}
          onClick={() => onSelect(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
});

export default CarouselIndicators;
