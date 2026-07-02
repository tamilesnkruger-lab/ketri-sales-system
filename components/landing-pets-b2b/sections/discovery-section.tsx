import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const proofSlots = ["vídeo de 1,5 milhão", "mapa dos estados", "comentários", "fotos", "números"];

export function DiscoverySection() {
  return (
    <SectionShell className="bg-ink text-white" eyebrow="Acreditar através de provas" id="discovery">
      <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <h2 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Tudo começou com um simples suporte para óculos em formato de gato.</h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/68">Esta área está preparada para inserir as provas que mostram a força da ideia: alcance, comentários, estados, fotos e números.</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {proofSlots.map((slot) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/74" key={slot}>{slot}</div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 rounded-[42px] border border-white/10" />
          <PlaceholderImage className="aspect-video min-h-[420px] rounded-[38px]" image={landingImageSlots.discovery} sizes="(min-width: 1024px) 58vw, 100vw" />
          <div className="absolute inset-x-8 bottom-8 rounded-3xl bg-white/85 p-5 text-ink shadow-soft backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf">Área principal do case</p>
            <p className="mt-2 text-lg font-semibold">Espaço reservado para vídeo, comentários e prova social real.</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}