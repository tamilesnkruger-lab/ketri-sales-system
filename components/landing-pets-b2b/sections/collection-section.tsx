import { hoverLiftClassName } from "../animation-classes";
import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const collections = ["Gateiros", "Dog Lovers", "Presentes", "Casa", "Recepção Veterinária"];

export function CollectionSection() {
  return (
    <SectionShell eyebrow="Conhecer a Coleção Pets e Tal" id="collection">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">Uma coleção para criar identificação antes mesmo da compra.</h2>
        <p className="max-w-md text-lg leading-8 text-ink/64">A página não lista o catálogo inteiro. Ela apresenta caminhos de coleção para o parceiro imaginar o espaço.</p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {collections.map((collection, index) => (
          <article className={`group overflow-hidden rounded-[30px] border border-ink/10 bg-white shadow-sm ${hoverLiftClassName} ${index === 0 ? "md:col-span-2 xl:col-span-1" : ""}`} key={collection}>
            <PlaceholderImage className="aspect-[4/4.6] rounded-none shadow-none" image={landingImageSlots.collection} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw" />
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf">Coleção</p>
              <h3 className="mt-3 text-2xl font-semibold text-ink">{collection}</h3>
              <p className="mt-4 text-sm leading-6 text-ink/58">Área preparada para foto real e curadoria da coleção.</p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}