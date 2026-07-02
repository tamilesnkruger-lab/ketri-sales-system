import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

export function SpaceSection() {
  return (
    <SectionShell className="bg-white" eyebrow="Imaginar sua loja com esse conceito" id="space">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div className="relative lg:-ml-16 xl:-ml-24">
          <div className="absolute -inset-5 rotate-[2deg] rounded-[52px] bg-[#40167E]" />
          <div className="absolute -bottom-8 -right-8 z-10 h-32 w-32 rounded-[42%_58%_64%_36%/48%_42%_58%_52%] bg-[#B6FF3B] shadow-[8px_8px_0_#20142F]" />
          <PlaceholderImage className="aspect-[16/10] min-h-[480px] rotate-[-1deg] border-[10px] border-[#B6FF3B] lg:min-h-[620px]" image={landingImageSlots.space} sizes="(min-width: 1024px) 68vw, 100vw" />
        </div>
        <div className="relative rounded-[34px] bg-[#FFF7E8] p-8 shadow-[10px_10px_0_#FF7A2D] lg:p-10">
          <h2 className="text-5xl font-black leading-[0.98] tracking-tight text-[#20142F] sm:text-6xl">Não é preciso transformar toda a sua loja.</h2>
          <p className="mt-7 text-2xl font-black leading-snug text-[#40167E] lg:text-3xl">Às vezes basta um pequeno espaço para criar um novo motivo para as pessoas entrarem nela.</p>
        </div>
      </div>
    </SectionShell>
  );
}