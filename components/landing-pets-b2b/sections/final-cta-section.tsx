import { SectionShell } from "../section-shell";

export function FinalCtaSection() {
  return (
    <SectionShell className="relative overflow-hidden bg-ink text-white" eyebrow="Tornar-se parceiro" id="final-cta">
      <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-leaf/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-semibold leading-tight sm:text-6xl lg:text-7xl">Sua cidade já tem uma referência para quem ama pets?</h2>
        <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-white/72">Se ainda não existe, talvez essa referência possa ser a sua empresa.</p>
        <a className="mt-11 inline-flex h-13 min-h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-ink shadow-[0_24px_70px_rgba(255,255,255,0.12)] transition hover:bg-maize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="mailto:contato@ketricriativa.com">
          Quero fazer parte da Coleção Pets e Tal
        </a>
      </div>
    </SectionShell>
  );
}