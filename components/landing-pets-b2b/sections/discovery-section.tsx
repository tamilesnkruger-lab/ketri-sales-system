import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const proofSlots = ["vídeo de 1,5 milhão", "mapa dos estados", "comentários", "fotos", "números"];

export function DiscoverySection() {
  return (
    <SectionShell className="bg-[#20142F] text-white" eyebrow="Acreditar através de provas" id="discovery">
      <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-[#FF7A2D]/35 blur-3xl" />
      <div className="grid gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
        <div>
          <p className="mb-5 inline-flex rotate-[-2deg] rounded-full bg-[#FF7A2D] px-5 py-2 text-sm font-black text-white shadow-[8px_8px_0_rgba(0,0,0,0.22)]">ponto de virada</p>
          <h2 className="text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl">Tudo começou com um simples suporte para óculos em formato de gato.</h2>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-white/72">Esta área está preparada para inserir as provas que mostram a força da ideia: alcance, comentários, estados, fotos e números.</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {proofSlots.map((slot) => (
              <div className="rounded-[22px] border-2 border-white/14 bg-white/8 p-4 text-sm font-black text-white shadow-[6px_6px_0_rgba(182,255,59,0.18)]" key={slot}>{slot}</div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rotate-[-2deg] rounded-[44px] bg-[#B6FF3B]" />
          <PlaceholderImage className="aspect-video min-h-[420px] rotate-[1deg] border-[10px] border-white" image={landingImageSlots.discovery} sizes="(min-width: 1024px) 58vw, 100vw" />
          <div className="absolute inset-x-7 bottom-7 rounded-[28px] bg-white p-5 text-[#20142F] shadow-[8px_8px_0_#FF7A2D]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#40167E]">Área principal do case</p>
            <p className="mt-2 text-lg font-black">Espaço reservado para vídeo, comentários e prova social real.</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}