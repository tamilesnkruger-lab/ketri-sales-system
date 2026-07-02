import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

export function SpaceSection() {
  return (
    <SectionShell eyebrow="Imaginar sua loja com esse conceito" id="space">
      <div className="grid gap-12 lg:grid-cols-[1.34fr_0.66fr] lg:items-center">
        <div className="relative lg:-ml-20 xl:-ml-28">
          <div className="absolute -inset-6 rounded-[46px] bg-paper" />
          <PlaceholderImage className="aspect-[16/10] min-h-[480px] lg:min-h-[620px]" image={landingImageSlots.space} sizes="(min-width: 1024px) 68vw, 100vw" />
        </div>
        <div className="lg:pl-4">
          <h2 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">Não é preciso transformar toda a sua loja.</h2>
          <p className="mt-7 text-2xl font-semibold leading-snug text-ink/68 lg:text-3xl">Às vezes basta um pequeno espaço para criar um novo motivo para as pessoas entrarem nela.</p>
        </div>
      </div>
    </SectionShell>
  );
}