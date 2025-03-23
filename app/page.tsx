"use client"

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud, Upload } from "lucide-react";
import CustomCarousel from "../custom-carousel";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import GalleryItem from "@/components/carousel/GalleryItem";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/Axios";
import WebSocket from "@/hooks/Socket";

export default function Home() {
  const { get, post } = useAxios();
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient();

  const { data: images, isLoading, isError, refetch } = useQuery({
    queryKey: ["images", page],
    queryFn: async () => await get("/api/images", { page }),
    enabled: true,
    select: (data) => data.data.images.data || [],
  });

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newImage, setNewImage] = useState({ title: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("upload");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize handlers to prevent unnecessary re-renders
  const openCarousel = useCallback((index: number) => {
    setStartIndex(index);
    setIsCarouselOpen(true);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setIsUploadDialogOpen(true);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpload = useCallback(async () => {
    if (!imageFile || !imagePreview) return;
    setIsUploading(true);

    // Simulate upload delay
    const form = new FormData();
    form.append("image", imageFile);
    form.append("title", newImage.title);
    form.append("description", newImage.description);

    await post("/api/images", form);

    queryClient.invalidateQueries({
      queryKey: ["images"],
    });

    // Reset form
    setImageFile(null);
    setImagePreview(null);
    setNewImage({ title: "", description: "" });
    setIsUploading(false);
    
    setCurrentTab("images");
  }, [imageFile, imagePreview, newImage]);

  useEffect(() => {
    WebSocket.on<unknown>("image:created", (data) => {
      toast.success("New image uploaded!");
      queryClient.invalidateQueries({
        queryKey: ["images"],
      });
    });

    WebSocket.on<unknown>("image:deleted", (data) => {
      toast.loading("Updating images...");
      queryClient.invalidateQueries({
        queryKey: ["images"],
      });
    });

    WebSocket.on<unknown>("image:reorder", (data) => {
      toast.loading("Updating images...");
      queryClient.invalidateQueries({
        queryKey: ["images"],
      });
    });

    return () => {
      WebSocket.off("image:created");
      WebSocket.off("image:deleted");
      WebSocket.off("image:reorder");
    };
  }, [WebSocket])

  return (
    <main className="flex flex-col min-h-screen p-4">
      {/* Add Toaster component to render notifications */}
      <Toaster />

      {/* Navigation Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <Tabs
          defaultValue="upload"
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-[200px]"
        >
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="mt-12 flex flex-col items-center justify-center">
        {currentTab === "upload" ? (
          <div className="w-full max-w-xl flex flex-col items-center justify-center">
            {/* Google-like centered logo */}
            <div className="mb-1 sm:mb-1">
              <div className="relative w-52 h-52 sm:w-64 sm:h-64">
                <Image
                  src="/logo.png"
                  alt="Otto Logo"
                  fill
                  priority
                  sizes="(max-width: 640px) 13rem, 16rem"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Google-like search/upload bar */}
            <div
              onClick={handleFileSelect}
              className="w-full max-w-md flex items-center px-4 py-5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-950"
            >
              <UploadCloud className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-gray-500">Click to upload an image</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6">Image Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* @ts-expect-error */}
              {images?.map((image, index) => (
                <GalleryItem
                  key={image.id}
                  image={image}
                  onClick={() => openCarousel(index)}
                  index={index}
                  totalImages={images.length}
                />
              ))}
            </div>
          </div>
        )}
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
                onChange={(e) =>
                  setNewImage({ ...newImage, title: e.target.value })
                }
                placeholder="Enter image title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newImage.description}
                onChange={(e) =>
                  setNewImage({ ...newImage, description: e.target.value })
                }
                rows={3}
                placeholder="Enter image description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={!newImage.title}>
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
          setImages={(data) => console.log(data)}
          initialIndex={startIndex}
          onClose={() => setIsCarouselOpen(false)}
        />
      )}
    </main>
  );
}
