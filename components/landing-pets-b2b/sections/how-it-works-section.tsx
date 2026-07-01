import { SectionShell } from "../section-shell";

const steps = ["Se torne parceiro", "Escolha as coleções", "Monte seu espaço", "Encante seus clientes", "Receba novidades"];

export function HowItWorksSection() {
  return (
    <SectionShell className="bg-paper" eyebrow="Imaginar a operação" id="how-it-works">
      <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">Como funciona</h2>
      <div className="mt-12 grid gap-4 lg:grid-cols-5">
        {steps.map((step, index) => (
          <article className="rounded-[24px] bg-white p-6 shadow-sm" key={step}>
            <p className="text-sm font-bold text-leaf">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-5 text-2xl font-semibold leading-tight text-ink">{step}</h3>
            {index < steps.length - 1 && <p className="mt-8 text-2xl text-ink/25">↓</p>}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}