import { SectionShell } from "../section-shell";

export function FinalCtaSection() {
  return (
    <SectionShell className="bg-ink text-white" eyebrow="Tornar-se parceiro" id="final-cta">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-semibold leading-tight sm:text-6xl">Sua cidade já tem uma referência para quem ama pets?</h2>
        <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-white/72">Se ainda não existe, talvez essa referência possa ser a sua empresa.</p>
        <a className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-ink transition hover:bg-maize" href="mailto:contato@ketricriativa.com">
          Quero fazer parte da Coleção Pets e Tal
        </a>
      </div>
    </SectionShell>
  );
}