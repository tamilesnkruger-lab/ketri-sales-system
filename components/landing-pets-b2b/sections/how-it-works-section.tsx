import { SectionShell } from "../section-shell";

const steps = ["Se torne parceiro", "Escolha as coleções", "Monte seu espaço", "Encante seus clientes", "Receba novidades"];

export function HowItWorksSection() {
  return (
    <SectionShell className="bg-paper" eyebrow="Imaginar a operação" id="how-it-works">
      <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">Como funciona</h2>
      <div className="mt-14 rounded-[34px] bg-white p-4 shadow-[0_28px_80px_rgba(24,33,47,0.08)] lg:p-6">
        <div className="grid gap-3 lg:grid-cols-5">
          {steps.map((step, index) => (
            <article className="relative rounded-[26px] bg-paper/70 p-6" key={step}>
              <p className="text-sm font-bold text-leaf">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-5 text-2xl font-semibold leading-tight text-ink">{step}</h3>
              {index < steps.length - 1 && <p className="mt-10 text-2xl text-ink/25 lg:absolute lg:right-4 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2">↓</p>}
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}