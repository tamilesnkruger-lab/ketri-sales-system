import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const proofSlots = ["vídeo de 1,5 milhão", "mapa dos estados", "comentários", "fotos", "números"];

export function DiscoverySection() {
  return (
    <SectionShell className="bg-ink text-white" eyebrow="Acreditar através de provas" id="discovery">
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">Tudo começou com um simples suporte para óculos em formato de gato.</h2>
          <p className="mt-6 text-lg leading-8 text-white/68">Esta área está preparada para inserir as provas que mostram a força da ideia: alcance, comentários, estados, fotos e números.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {proofSlots.map((slot) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-white/70" key={slot}>{slot}</div>
            ))}
          </div>
        </div>
        <PlaceholderImage className="aspect-[4/3]" image={landingImageSlots.discovery} sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
    </SectionShell>
  );
}