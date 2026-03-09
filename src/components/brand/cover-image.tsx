import Image from "next/image"

import { cn } from "@/lib/utils"

const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video",
  "3:4": "aspect-[3/4]",
} as const

interface CoverImageProps {
  src: string
  alt: string
  aspectRatio?: keyof typeof aspectRatios
  priority?: boolean
  className?: string
}

export function CoverImage({
  src,
  alt,
  aspectRatio = "video",
  priority = false,
  className,
}: CoverImageProps) {
  return (
    <div
      data-slot="cover-image"
      className={cn(
        "relative w-full overflow-hidden bg-muted",
        aspectRatios[aspectRatio],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
