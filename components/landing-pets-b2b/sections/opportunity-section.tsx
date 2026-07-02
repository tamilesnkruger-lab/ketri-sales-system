import { SectionShell } from "../section-shell";

const todayItems = ["Rações", "Brinquedos", "Coleiras", "Caminhas", "Petiscos", "Medicamentos"];
const moreItems = ["Presentes", "Decoração", "Organização", "Produtos criativos", "Itens para casa", "Produtos que representam sua paixão pelos animais"];

export function OpportunitySection() {
  return (
    <SectionShell className="bg-[#FFF7E8]" eyebrow="Descobrir uma oportunidade" id="opportunity">
      <div className="grid gap-12 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
        <h2 className="max-w-xl text-5xl font-black leading-[0.98] tracking-tight text-[#20142F] sm:text-6xl">Você já parou para pensar nisso?</h2>
        <div className="relative grid gap-5 md:grid-cols-2">
          <div className="absolute left-1/2 top-1/2 hidden h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#B6FF3B] text-2xl font-black text-[#20142F] shadow-soft md:flex">vs</div>
          <article className="rounded-[34px] border-4 border-[#20142F] bg-white p-8 shadow-[12px_12px_0_#20142F]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#40167E]">Hoje</p>
            <h3 className="mt-4 text-2xl font-black text-[#20142F]">Hoje sua loja oferece</h3>
            <ul className="mt-8 grid gap-4 text-base font-bold text-[#20142F]/70">
              {todayItems.map((item) => <li className="flex items-center gap-3" key={item}><span className="h-2.5 w-2.5 rounded-full bg-[#40167E]" />{item}</li>)}
            </ul>
          </article>
          <article className="rounded-[34px] bg-[#20142F] p-8 text-white shadow-[12px_12px_0_#B6FF3B]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6FF3B]">Oportunidade</p>
            <h3 className="mt-4 text-2xl font-black">Mas quem ama os pets procura muito mais.</h3>
            <ul className="mt-8 grid gap-4 text-base font-bold text-white/82">
              {moreItems.map((item) => <li className="flex items-center gap-3" key={item}><span className="h-2.5 w-2.5 rounded-full bg-[#FF7A2D]" />{item}</li>)}
            </ul>
          </article>
        </div>
      </div>
      <p className="mt-16 max-w-5xl text-4xl font-black leading-tight text-[#40167E] sm:text-5xl">
        Enquanto muitos vendem produtos para os animais, poucos criam um espaço pensado para quem ama viver ao lado deles.
      </p>
    </SectionShell>
  );
}