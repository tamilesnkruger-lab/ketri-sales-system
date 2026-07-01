import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const cards = ["Mercado pet", "Humanização", "Crescimento", "Compra emocional", "Ticket médio"];

export function MarketSection() {
  return (
    <SectionShell eyebrow="Entender o mercado" id="market">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <h2 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">Um mercado preparado para uma nova forma de encantar.</h2>
          <p className="mt-6 text-lg leading-8 text-ink/65">Esta seção está preparada para receber dados reais sobre comportamento, crescimento e compra emocional no universo pet.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <article className="rounded-[22px] border border-ink/10 bg-white p-6 shadow-sm" key={card}>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-leaf">Dado futuro</p>
              <h3 className="mt-4 text-2xl font-semibold text-ink">{card}</h3>
              <div className="mt-6 h-2 w-24 rounded-full bg-maize" />
            </article>
          ))}
        </div>
      </div>
      <PlaceholderImage className="mt-12 aspect-[16/7]" image={landingImageSlots.market} sizes="100vw" />
    </SectionShell>
  );
}