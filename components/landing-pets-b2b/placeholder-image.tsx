import Image from "next/image";
import type { LandingImageSlot } from "./landing-assets";

type PlaceholderImageProps = {
  className?: string;
  image: LandingImageSlot;
  sizes: string;
};

export function PlaceholderImage({ className = "", image, sizes }: PlaceholderImageProps) {
  return (
    <div className={`relative isolate overflow-hidden rounded-[34px] bg-paper shadow-[0_36px_90px_rgba(24,33,47,0.12)] ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(227,185,77,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.56),rgba(255,255,255,0))]" />
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