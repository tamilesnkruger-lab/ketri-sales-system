import Image from "next/image";
import type { LandingImageSlot } from "./landing-assets";

type PlaceholderImageProps = {
  className?: string;
  image: LandingImageSlot;
  sizes: string;
};

export function PlaceholderImage({ className = "", image, sizes }: PlaceholderImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-paper ${className}`}>
      <Image
        alt={image.alt}
        className="object-cover"
        fill
        priority={image.priority}
        sizes={sizes}
        src={image.src}
      />
    </div>
  );
}