import { hoverLiftClassName } from "../animation-classes";
import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const collections = ["Gateiros", "Dog Lovers", "Presentes", "Casa", "Recepção Veterinária"];

export function CollectionSection() {
  return (
    <SectionShell eyebrow="Conhecer a Coleção Pets e Tal" id="collection">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">Uma coleção para criar identificação antes mesmo da compra.</h2>
        <p className="max-w-md text-lg leading-8 text-ink/65">A página não lista o catálogo inteiro. Ela apresenta caminhos de coleção para o parceiro imaginar o espaço.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {collections.map((collection) => (
          <article className={`overflow-hidden rounded-[24px] border border-ink/10 bg-white shadow-sm ${hoverLiftClassName}`} key={collection}>
            <PlaceholderImage className="aspect-[4/3] rounded-none" image={landingImageSlots.collection} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw" />
            <div className="p-5">
              <h3 className="text-xl font-bold text-ink">{collection}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/60">Área preparada para foto real e curadoria da coleção.</p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}