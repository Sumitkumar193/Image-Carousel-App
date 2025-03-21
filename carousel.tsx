"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image" // Import Next.js Image component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus, Upload, X, ArrowUpDown } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import initialImages from "@/components/sample/data.json";

export default function Carousel() {
  const [images, setImages] = useState(initialImages)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplayInterval, setAutoplayInterval] = useState(5)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Handle automatic rotation
  useEffect(() => {
    if (isAutoplay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
      }, autoplayInterval * 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoplayInterval, isAutoplay, images.length])

  // Handle next and previous navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Add new image
  const handleAddImage = () => {
    if (newImage.title && (imageFile || imagePreview)) {
      const newId = (Number.parseInt(images[images.length - 1]?.id || "0") + 1).toString()
      const newImageObj = {
        id: newId,
        src: imagePreview || "/placeholder.svg?height=500&width=800",
        title: newImage.title,
        description: newImage.description,
      }

      setImages([...images, newImageObj])
      setNewImage({ title: "", description: "" })
      setImageFile(null)
      setImagePreview(null)
      setIsAddDialogOpen(false)
    }
  }

  // Handle reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(images)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setImages(items)
  }

  // Calculate which indicators to display (limit to 7)
  const getVisibleIndicators = () => {
    const maxIndicators = 7;
    
    // If we have 7 or fewer images, show all indicators
    if (images.length <= maxIndicators) {
      return images.map((_, i) => i);
    }
    
    // Otherwise, calculate which 7 to show
    let startIndex = Math.max(0, currentIndex - Math.floor(maxIndicators / 2));
    let endIndex = startIndex + maxIndicators - 1;
    
    // Adjust if we're too close to the end
    if (endIndex >= images.length) {
      endIndex = images.length - 1;
      startIndex = Math.max(0, endIndex - maxIndicators + 1);
    }
    
    return Array.from({ length: maxIndicators }, (_, i) => startIndex + i);
  };

  const visibleIndicators = getVisibleIndicators();
  const showStartEllipsis = visibleIndicators[0] > 0;
  const showEndEllipsis = visibleIndicators[visibleIndicators.length - 1] < images.length - 1;

  // Calculate which images should be preloaded (current, next, previous)
  const getImageLoadingPriority = (index: number) => {
    if (images.length <= 3) return true; // If few images, prioritize all
    
    // Current image and adjacent ones get priority
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const nextIndex = (currentIndex + 1) % images.length;
    return index === currentIndex || index === prevIndex || index === nextIndex;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[16/9] mb-4">
        {/* Carousel Images */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={image.id} className="min-w-full h-full flex-shrink-0 relative">
              <div className="relative w-full h-full">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  sizes="(max-width: 1536px) 100vw, 1536px"
                  className="object-cover"
                  priority={getImageLoadingPriority(index)}
                  loading={getImageLoadingPriority(index) ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJc4yWCqwAAAABJRU5ErkJggg=="
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <h3 className="text-xl font-bold">{image.title}</h3>
                <p className="text-sm opacity-90">{image.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAutoplay(!isAutoplay)}>
            {isAutoplay ? "Pause" : "Play"} Autoplay
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm whitespace-nowrap">Interval: {autoplayInterval}s</span>
            <Slider
              value={[autoplayInterval]}
              min={1}
              max={10}
              step={1}
              className="w-32"
              onValueChange={(value) => setAutoplayInterval(value[0])}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Reorder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reorder Images</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="carousel-images">
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {images.map((image, index) => (
                          <Draggable key={image.id} draggableId={image.id} index={index}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border"
                              >
                                <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden relative">
                                  <Image
                                    src={image.src || "/placeholder.svg"}
                                    alt={image.title}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{image.title}</p>
                                  <p className="text-sm text-gray-500 truncate">{image.description}</p>
                                </div>
                                <ArrowUpDown className="h-5 w-5 text-gray-400" />
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 items-center">
        {showStartEllipsis && (
          <button 
            className="text-gray-500 text-sm px-1"
            onClick={() => setCurrentIndex(0)}
            aria-label="Go to first slide"
          >
            •••
          </button>
        )}
        
        {visibleIndicators.map(index => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              currentIndex === index ? "w-8 bg-primary" : "w-2 bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        
        {showEndEllipsis && (
          <button 
            className="text-gray-500 text-sm px-1"
            onClick={() => setCurrentIndex(images.length - 1)}
            aria-label="Go to last slide"
          >
            •••
          </button>
        )}
      </div>
    </div>
  )
}

