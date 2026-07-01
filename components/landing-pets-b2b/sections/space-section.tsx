import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

export function SpaceSection() {
  return (
    <SectionShell eyebrow="Imaginar sua loja com esse conceito" id="space">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <PlaceholderImage className="aspect-[16/10]" image={landingImageSlots.space} sizes="(min-width: 1024px) 58vw, 100vw" />
        <div>
          <h2 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">Não é preciso transformar toda a sua loja.</h2>
          <p className="mt-6 text-2xl font-semibold leading-snug text-ink/70">Às vezes basta um pequeno espaço para criar um novo motivo para as pessoas entrarem nela.</p>
        </div>
      </div>
    </SectionShell>
  );
}