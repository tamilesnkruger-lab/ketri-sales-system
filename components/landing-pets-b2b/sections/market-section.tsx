import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const cards = ["Mercado pet", "Humanização", "Crescimento", "Compra emocional", "Ticket médio"];

export function MarketSection() {
  return (
    <SectionShell className="bg-white" eyebrow="Entender o mercado" id="market">
      <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <h2 className="text-5xl font-black leading-[0.98] tracking-tight text-[#20142F] sm:text-6xl">Um mercado preparado para uma nova forma de encantar.</h2>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-[#20142F]/68">Esta seção está preparada para receber dados reais sobre comportamento, crescimento e compra emocional no universo pet.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, index) => (
            <article className={index === 0 ? "rounded-[32px] bg-[#40167E] p-7 text-white shadow-[10px_10px_0_#B6FF3B] sm:col-span-2" : "rounded-[32px] border-4 border-[#20142F] bg-[#FFF7E8] p-7 shadow-[8px_8px_0_rgba(32,20,47,0.16)]"} key={card}>
              <p className={index === 0 ? "text-sm font-black uppercase tracking-[0.16em] text-[#B6FF3B]" : "text-sm font-black uppercase tracking-[0.16em] text-[#40167E]"}>Dado futuro</p>
              <h3 className={index === 0 ? "mt-5 text-5xl font-black text-white" : "mt-5 text-3xl font-black text-[#20142F]"}>{card}</h3>
              <div className={index === 0 ? "mt-8 h-3 w-40 rounded-full bg-[#FF7A2D]" : "mt-8 h-3 w-28 rounded-full bg-[#B6FF3B]"} />
            </article>
          ))}
        </div>
      </div>
      <PlaceholderImage className="mt-16 aspect-[16/7] min-h-[360px] border-[8px] border-[#20142F]" image={landingImageSlots.market} sizes="100vw" />
    </SectionShell>
  );
}