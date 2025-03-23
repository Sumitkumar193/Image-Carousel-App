import React, { useMemo } from 'react';
import Image from 'next/image';
import { useCarouselLoading } from './carousel-loading-provider';


type Image = {
  id: string;
  url: string;
  title: string;
  description: string;
}

interface CarouselSlideProps {
  image: Image;
  isCurrentSlide: boolean;
  isNextSlide: boolean;
  direction: number;
  isTransitioning: boolean;
}

const CarouselSlide = React.memo(function CarouselSlide({
  image,
  isCurrentSlide,
  isNextSlide,
  direction,
  isTransitioning,
}: CarouselSlideProps) {
  // Get loading state from context
  const { isImageLoaded, markImageLoaded } = useCarouselLoading();
  const imageLoaded = isImageLoaded(image.id);
  
  // Calculate position classes based on transition state
  let slideClass = "";
  
  if (isCurrentSlide) {
    if (!isTransitioning) {
      slideClass = "left-0 z-10";
    } else {
      slideClass = direction > 0 ? "-left-full z-0" : "left-full z-0";
    }
  } else if (isNextSlide) {
    slideClass = "left-0 z-10";
  }
  
  // Memoize the blur data URL to prevent regeneration
  const blurDataURL = useMemo(() => 
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJc4yWCqwAAAABJRU5ErkJggg==", 
    []
  );
  
  // Properly handle data URLs
  const isDataUrl = image.url.startsWith('data:');
  
  return (
    <div
      className={`absolute top-0 h-full w-full flex items-center justify-center transition-all duration-300 ease-in-out ${slideClass}`}
      style={{ 
        transform: isTransitioning && isCurrentSlide 
          ? `translateX(${direction > 0 ? '-100%' : '100%'})` 
          : isTransitioning && isNextSlide
          ? 'translateX(0%)' 
          : 'translateX(0%)',
        transition: 'transform 300ms ease-in-out'
      }}
    >
      <div className="relative h-full max-h-[80vh] w-full flex items-center justify-center">
        <div className="relative w-full h-full max-w-[90%] max-h-[80%]">
          <Image
            src={ process.env.NEXT_PUBLIC_BACKEND_URL + image.url || "/placeholder.svg"}
            alt={image.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority={isCurrentSlide} // Current slide gets priority loading
            loading={isCurrentSlide || isNextSlide ? "eager" : "lazy"}
            className="object-contain"
            placeholder="blur"
            blurDataURL={blurDataURL}
            unoptimized={isDataUrl} // Important for data URLs
            onLoadingComplete={() => markImageLoaded(image.id)}
            onError={() => {
              console.error(`Failed to load image: ${image.url}`);
            }}
          />
        </div>
      </div>
      
      {/* Title and description overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white transition-opacity duration-300 ${
          isTransitioning && isCurrentSlide ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2 className="text-2xl font-bold mb-2">{image.title}</h2>
        <p className="text-lg opacity-90">{image.description}</p>
      </div>
    </div>
  );
});

export default CarouselSlide;
