import Image from "next/image";
import type { LandingImageSlot } from "./landing-assets";

type PlaceholderImageProps = {
  className?: string;
  image: LandingImageSlot;
  sizes: string;
};

export function PlaceholderImage({ className = "", image, sizes }: PlaceholderImageProps) {
  return (
    <div className={`relative isolate overflow-hidden rounded-[38px] bg-[#2B135A] shadow-[0_34px_90px_rgba(64,22,126,0.28)] ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(182,255,59,0.36),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(255,122,45,0.30),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
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