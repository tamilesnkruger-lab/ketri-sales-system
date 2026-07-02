import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";

export function HeroSection() {
  return (
    <section className="overflow-hidden px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pb-28">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div className="max-w-3xl lg:py-16">
          <p className="mb-7 text-xs font-bold uppercase tracking-[0.22em] text-leaf">Coleção Pets e Tal para empresas</p>
          <h1 className="text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl lg:text-7xl xl:text-8xl">
            Enquanto todo mundo vende para os pets...
            <span className="mt-5 block text-leaf">Quem está vendendo para quem ama os pets?</span>
          </h1>
          <div className="mt-8 grid max-w-2xl gap-4 text-lg leading-8 text-ink/68 sm:text-xl">
            <p>Existe um público apaixonado por pets procurando mais do que ração, brinquedos e acessórios.</p>
            <p>A Coleção Pets e Tal ajuda empresas a criar um espaço exclusivo para quem ama animais e procuram presentes, decoração e produtos cheios de personalidade.</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm font-bold text-white transition hover:bg-leaf focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf" href="#collection">
              Conhecer a Coleção
            </a>
            <a className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-7 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf" href="#final-cta">
              Quero ser parceiro
            </a>
          </div>
        </div>
        <div className="relative lg:-mr-24 xl:-mr-32">
          <div className="absolute -inset-8 rounded-[48px] bg-paper" />
          <PlaceholderImage className="aspect-[4/5] min-h-[520px] lg:aspect-[1.08/1] lg:min-h-[680px]" image={landingImageSlots.hero} sizes="(min-width: 1024px) 62vw, 100vw" />
        </div>
      </div>
    </section>
  );
}