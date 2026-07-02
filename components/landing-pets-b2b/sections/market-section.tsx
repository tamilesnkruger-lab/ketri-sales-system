import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const cards = ["Mercado pet", "Humanização", "Crescimento", "Compra emocional", "Ticket médio"];

export function MarketSection() {
  return (
    <SectionShell eyebrow="Entender o mercado" id="market">
      <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <h2 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">Um mercado preparado para uma nova forma de encantar.</h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-ink/64">Esta seção está preparada para receber dados reais sobre comportamento, crescimento e compra emocional no universo pet.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, index) => (
            <article className={index === 0 ? "rounded-[28px] bg-ink p-7 text-white shadow-soft sm:col-span-2" : "rounded-[28px] border border-ink/10 bg-white p-7 shadow-sm"} key={card}>
              <p className={index === 0 ? "text-sm font-bold uppercase tracking-[0.16em] text-white/45" : "text-sm font-bold uppercase tracking-[0.16em] text-leaf"}>Dado futuro</p>
              <h3 className={index === 0 ? "mt-5 text-4xl font-semibold text-white" : "mt-5 text-2xl font-semibold text-ink"}>{card}</h3>
              <div className={index === 0 ? "mt-8 h-2 w-36 rounded-full bg-maize" : "mt-8 h-2 w-24 rounded-full bg-maize/75"} />
            </article>
          ))}
        </div>
      </div>
      <PlaceholderImage className="mt-16 aspect-[16/7] min-h-[360px]" image={landingImageSlots.market} sizes="100vw" />
    </SectionShell>
  );
}