"use client"

import { useState, useRef, useCallback, memo } from "react"
import Image from "next/image"
import { ImageWithPlaceholder } from "@/components/ui/image-placeholder"
import CustomCarousel from "../custom-carousel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import initialImages from "@/components/sample/data.json"

const GalleryItem = memo(function GalleryItem({
  image, 
  onClick,
  index,
  totalImages
}: { 
  image: { id: string; src: string; title: string; description: string };
  onClick: () => void;
  index: number;
  totalImages: number;
}) {
  // Prioritize the first few images for better LCP and initial loading experience
  const isPriority = index < 3;
  
  // Handle data URLs properly
  const isDataUrl = image.src.startsWith('data:');
  
  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group h-[200px]"
      onClick={onClick}
    >
      <Image
        src={image.src || "/placeholder.svg"}
        alt={image.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority={isPriority}
        loading={isPriority ? "eager" : "lazy"}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJc4yWCqwAAAABJRU5ErkJggg=="
        unoptimized={isDataUrl} // Important for data URLs
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
        <h3 className="text-white text-lg font-bold">{image.title}</h3>
        <p className="text-white/80 text-sm">{image.description}</p>
      </div>
    </div>
  );
});

export default function Home() {
  const [images, setImages] = useState(initialImages)
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newImage, setNewImage] = useState({ title: "", description: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Memoize handlers to prevent unnecessary re-renders
  const openCarousel = useCallback((index: number) => {
    setStartIndex(index)
    setIsCarouselOpen(true)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setIsUploadDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleClickSearchBar = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleAddImage = useCallback(() => {
    if (newImage.title && imagePreview) {
      const newId = (Number.parseInt(images[images.length - 1]?.id || "0") + 1).toString()
      const newImageObj = {
        id: newId,
        src: imagePreview,
        title: newImage.title,
        description: newImage.description,
      }

      setImages(prev => [...prev, newImageObj])
      setNewImage({ title: "", description: "" })
      setImageFile(null)
      setImagePreview(null)
      setIsUploadDialogOpen(false)
    }
  }, [images, imagePreview, newImage.description, newImage.title])

  return (
    <main className="container mx-auto p-4">
      {/* Upload Section with Logo */}
      <div className="flex flex-col items-center mb-10">
        <Image 
          src="/logo.png" 
          alt="Company Logo" 
          width={272}
          height={92}
          priority // Logo is important for LCP
          className="mb-6"
        />
        <div 
          className="w-full max-w-2xl flex items-center border rounded-full px-4 py-2 bg-white shadow cursor-pointer"
          onClick={handleClickSearchBar}
        >
          <Upload className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-500">Click to upload an image...</span>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">Image Gallery</h1>

      {/* Image Grid - using the memoized GalleryItem component with optimization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <GalleryItem 
            key={image.id}
            image={image}
            onClick={() => openCarousel(index)}
            index={index}
            totalImages={images.length}
          />
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {imagePreview && (
              <div className="relative h-40 mt-2 rounded overflow-hidden">
                {/* We use standard img for preview since imagePreview is a data URL */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                placeholder="Enter image title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newImage.description}
                onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                rows={3}
                placeholder="Enter image description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddImage} disabled={!newImage.title}>
              <Upload className="h-4 w-4 mr-2" />
              Add to Gallery
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Only render carousel when it's open (performance optimization) */}
      {isCarouselOpen && (
        <CustomCarousel
          images={images}
          setImages={setImages}
          initialIndex={startIndex}
          onClose={() => setIsCarouselOpen(false)}
        />
      )}
    </main>
  )
}

