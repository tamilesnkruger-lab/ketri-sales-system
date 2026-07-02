import { SectionShell } from "../section-shell";

const todayItems = ["Rações", "Brinquedos", "Coleiras", "Caminhas", "Petiscos", "Medicamentos"];
const moreItems = ["Presentes", "Decoração", "Organização", "Produtos criativos", "Itens para casa", "Produtos que representam sua paixão pelos animais"];

export function OpportunitySection() {
  return (
    <SectionShell className="bg-paper" eyebrow="Descobrir uma oportunidade" id="opportunity">
      <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <h2 className="max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:sticky lg:top-12">Você já parou para pensar nisso?</h2>
        <div className="relative grid gap-5 md:grid-cols-2">
          <div className="absolute left-1/2 top-8 hidden h-[calc(100%-64px)] w-px bg-ink/10 md:block" />
          <article className="rounded-[30px] border border-ink/10 bg-white p-8 shadow-[0_24px_70px_rgba(24,33,47,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/35">Hoje</p>
            <h3 className="mt-4 text-2xl font-semibold text-ink">Hoje sua loja oferece</h3>
            <ul className="mt-8 grid gap-4 text-base font-semibold text-ink/62">
              {todayItems.map((item) => <li className="flex items-center gap-3" key={item}><span className="h-1.5 w-1.5 rounded-full bg-ink/25" />{item}</li>)}
            </ul>
          </article>
          <article className="rounded-[30px] bg-ink p-8 text-white shadow-[0_34px_90px_rgba(24,33,47,0.22)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">Oportunidade</p>
            <h3 className="mt-4 text-2xl font-semibold">Mas quem ama os pets procura muito mais.</h3>
            <ul className="mt-8 grid gap-4 text-base font-semibold text-white/78">
              {moreItems.map((item) => <li className="flex items-center gap-3" key={item}><span className="h-1.5 w-1.5 rounded-full bg-maize" />{item}</li>)}
            </ul>
          </article>
        </div>
      </div>
      <p className="mt-16 max-w-5xl text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
        Enquanto muitos vendem produtos para os animais, poucos criam um espaço pensado para quem ama viver ao lado deles.
      </p>
    </SectionShell>
  );
}