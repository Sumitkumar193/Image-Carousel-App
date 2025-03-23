import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageInterface } from '@/lib/utils';
import useAxios from '@/hooks/Axios';

interface ReorderPayload {
  image: ImageInterface;
  index: number;
}

interface ReorderControlsProps {
  isOpen: boolean;
  images: ImageInterface[];
  onReorder: (reorderedImages: ImageInterface[]) => void;
}

const ReorderControls = React.memo(function ReorderControls({
  isOpen,
  images,
  onReorder,
}: ReorderControlsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { put } = useAxios();

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    try {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      const newImages = [...images];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedImage);
      onReorder(newImages);
      setDraggedIndex(index);
    } catch (error) {
      console.error('Failed to update image order:', error);
    }
  };

  const updateImageOrder = async (imageId: string, newOrder: number) => {
    try {
      const response = await put(`/api/images/${imageId}`, { order: newOrder });
      return response.data;
    } catch (error) {
      console.error('Error updating image order:', error);
      throw error;
    }
  };

  const { mutate } = useMutation({
    mutationFn: ({image, index} : ReorderPayload) => updateImageOrder(image.id, index),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['images'],
      });
      setDraggedIndex(null);
      toast.success('Image order updated successfully');
    },
  });

  const handleDragEnd = (image: ImageInterface) => {
    if (draggedIndex === null) return;
    mutate({image, index: draggedIndex});
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
            onDragEnd={() => handleDragEnd(image)}
            className={`relative cursor-move border-2 ${
              draggedIndex === index ? "border-blue-500" : "border-transparent"
            } rounded overflow-hidden aspect-video`}
          >
            <Image
              src={ process.env.NEXT_PUBLIC_BACKEND_URL + image.url || "/placeholder.svg"}
              alt={image.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              className="object-cover"
              loading="lazy" // Use lazy loading for thumbnail images
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJc4yWCqwAAAABJRU5ErkJggg=="
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white font-bold">{image.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ReorderControls;
