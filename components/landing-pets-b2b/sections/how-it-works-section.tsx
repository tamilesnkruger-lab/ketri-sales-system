import { SectionShell } from "../section-shell";

const steps = ["Se torne parceiro", "Escolha as coleções", "Monte seu espaço", "Encante seus clientes", "Receba novidades"];

export function HowItWorksSection() {
  return (
    <SectionShell className="bg-[#B6FF3B]" eyebrow="Imaginar a operação" id="how-it-works">
      <h2 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-[#20142F] sm:text-6xl">Como funciona</h2>
      <div className="mt-14 rounded-[38px] border-4 border-[#20142F] bg-white p-4 shadow-[14px_14px_0_#40167E] lg:p-6">
        <div className="grid gap-3 lg:grid-cols-5">
          {steps.map((step, index) => (
            <article className="relative rounded-[28px] bg-[#FFF7E8] p-6" key={step}>
              <p className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#40167E] text-sm font-black text-white">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-5 text-2xl font-black leading-tight text-[#20142F]">{step}</h3>
              {index < steps.length - 1 && <p className="mt-10 text-3xl font-black text-[#FF7A2D] lg:absolute lg:right-4 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2">↓</p>}
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}