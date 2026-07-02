import { SectionShell } from "../section-shell";

export function FinalCtaSection() {
  return (
    <SectionShell className="relative overflow-hidden bg-[#40167E] text-white" eyebrow="Tornar-se parceiro" id="final-cta">
      <div className="absolute -left-20 top-10 h-80 w-80 rounded-[52%_48%_40%_60%/58%_42%_58%_42%] bg-[#B6FF3B]/80" />
      <div className="absolute bottom-[-140px] right-[-100px] h-[420px] w-[420px] rounded-full bg-[#FF7A2D]/70 blur-2xl" />
      <div className="relative mx-auto max-w-5xl rounded-[44px] border-4 border-white/80 bg-[#20142F] p-8 text-center shadow-[16px_16px_0_#B6FF3B] sm:p-12 lg:p-16">
        <h2 className="text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">Sua cidade já tem uma referência para quem ama pets?</h2>
        <p className="mx-auto mt-8 max-w-2xl text-xl font-semibold leading-8 text-white/78">Se ainda não existe, talvez essa referência possa ser a sua empresa.</p>
        <a className="mt-11 inline-flex h-13 min-h-12 items-center justify-center rounded-full bg-[#B6FF3B] px-8 text-sm font-black text-[#20142F] shadow-[0_20px_55px_rgba(182,255,59,0.32)] transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="mailto:contato@ketricriativa.com">
          Quero fazer parte da Coleção Pets e Tal
        </a>
      </div>
    </SectionShell>
  );
}