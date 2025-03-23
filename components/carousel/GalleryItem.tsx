import { memo } from "react";
import Image from "next/image";

const GalleryItem = memo(function GalleryItem({
  image,
  onClick,
  index,
  totalImages,
}: {
  image: { id: string; src: string; title: string; description: string };
  onClick: () => void;
  index: number;
  totalImages: number;
}) {
  // Prioritize the first few images for better LCP and initial loading experience
  const isPriority = index < 3;

  // Handle data URLs properly
  const isDataUrl = image.src.startsWith("data:");

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

export default GalleryItem;
