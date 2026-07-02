import { hoverLiftClassName } from "../animation-classes";
import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";
import { SectionShell } from "../section-shell";

const collections = ["Gateiros", "Dog Lovers", "Presentes", "Casa", "Recepção Veterinária"];
const colors = ["#B6FF3B", "#FF7A2D", "#29B6F6", "#F7D84B", "#FF5DB1"];

export function CollectionSection() {
  return (
    <SectionShell className="bg-[#FFF7E8]" eyebrow="Conhecer a Coleção Pets e Tal" id="collection">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-tight text-[#20142F] sm:text-6xl">Uma coleção para criar identificação antes mesmo da compra.</h2>
        <p className="max-w-md text-lg font-semibold leading-8 text-[#20142F]/68">A página não lista o catálogo inteiro. Ela apresenta caminhos de coleção para o parceiro imaginar o espaço.</p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {collections.map((collection, index) => (
          <article className={`group overflow-hidden rounded-[34px] border-4 border-[#20142F] bg-white shadow-[10px_10px_0_rgba(32,20,47,0.16)] ${hoverLiftClassName}`} key={collection}>
            <div className="p-3" style={{ backgroundColor: colors[index] }}>
              <PlaceholderImage className="aspect-[4/4.6] rounded-[24px] shadow-none" image={landingImageSlots.collection} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw" />
            </div>
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#40167E]">Coleção</p>
              <h3 className="mt-3 text-3xl font-black leading-none text-[#20142F]">{collection}</h3>
              <p className="mt-4 text-sm font-semibold leading-6 text-[#20142F]/62">Área preparada para foto real e curadoria da coleção.</p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}