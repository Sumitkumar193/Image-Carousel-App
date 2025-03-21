import React from 'react';

interface CarouselControlsProps {
  isAutoplay: boolean;
  setIsAutoplay: React.Dispatch<React.SetStateAction<boolean>>;
  autoplayInterval: number;
  setAutoplayInterval: React.Dispatch<React.SetStateAction<number>>;
  onAddImage: () => void;
  onToggleReorderMode: () => void;
  isReorderMode: boolean;
}

const CarouselControls = React.memo(function CarouselControls({
  isAutoplay,
  setIsAutoplay,
  autoplayInterval,
  setAutoplayInterval,
  onAddImage,
  onToggleReorderMode,
  isReorderMode,
}: CarouselControlsProps) {
  return (
    <div className="bg-black/70 p-4 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          className={`px-4 py-2 rounded ${isAutoplay ? "bg-white text-black" : "bg-gray-800 text-white"} transition-colors`}
          onClick={() => setIsAutoplay(!isAutoplay)}
        >
          {isAutoplay ? "Pause" : "Play"} Autoplay
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white whitespace-nowrap">Interval: {autoplayInterval}s</span>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={autoplayInterval}
            onChange={(e) => setAutoplayInterval(Number.parseInt(e.target.value))}
            className="w-32 accent-white"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className={`px-4 py-2 ${isReorderMode ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} text-white rounded transition-colors flex items-center gap-2`}
          onClick={onToggleReorderMode}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="7 16 3 12 7 8"></polyline>
            <polyline points="17 8 21 12 17 16"></polyline>
            <line x1="3" y1="12" x2="21" y2="12"></line>
          </svg>
          {isReorderMode ? "Done Reordering" : "Reorder Images"}
        </button>
      </div>
    </div>
  );
});

export default CarouselControls;
