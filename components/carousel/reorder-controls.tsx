import React, { useState } from 'react';
import Image from 'next/image';

interface Image {
  id: string;
  src: string;
  title: string;
  description: string;
}

interface ReorderControlsProps {
  isOpen: boolean;
  images: Image[];
  onReorder: (reorderedImages: Image[]) => void;
}

const ReorderControls = React.memo(function ReorderControls({
  isOpen,
  images,
  onReorder,
}: ReorderControlsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];

    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    onReorder(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-24 left-4 right-4 bg-black/80 rounded-lg p-4 z-30">
      <h3 className="text-white text-lg font-bold mb-3">Drag and Drop to Reorder</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative cursor-move border-2 ${
              draggedIndex === index ? "border-blue-500" : "border-transparent"
            } rounded overflow-hidden aspect-video`}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              className="object-cover"
              loading="lazy" // Use lazy loading for thumbnail images
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJc4yWCqwAAAABJRU5ErkJggg=="
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white font-bold">{index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ReorderControls;
