import { SectionShell } from "../section-shell";

const todayItems = ["Rações", "Brinquedos", "Coleiras", "Caminhas", "Petiscos", "Medicamentos"];
const moreItems = ["Presentes", "Decoração", "Organização", "Produtos criativos", "Itens para casa", "Produtos que representam sua paixão pelos animais"];

export function OpportunitySection() {
  return (
    <SectionShell className="bg-paper" eyebrow="Descobrir uma oportunidade" id="opportunity">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <h2 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">Você já parou para pensar nisso?</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-[24px] bg-white p-7 shadow-soft">
            <h3 className="text-xl font-bold text-ink">Hoje sua loja oferece</h3>
            <ul className="mt-6 grid gap-3 text-base font-semibold text-ink/65">
              {todayItems.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </article>
          <article className="rounded-[24px] bg-ink p-7 text-white shadow-soft">
            <h3 className="text-xl font-bold">Mas quem ama os pets procura muito mais.</h3>
            <ul className="mt-6 grid gap-3 text-base font-semibold text-white/75">
              {moreItems.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </article>
        </div>
      </div>
      <p className="mt-12 max-w-4xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        Enquanto muitos vendem produtos para os animais, poucos criam um espaço pensado para quem ama viver ao lado deles.
      </p>
    </SectionShell>
  );
}