import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";

export function HeroSection() {
  return (
    <section className="px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-24">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-leaf">Coleção Pets e Tal para empresas</p>
          <h1 className="text-5xl font-semibold leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
            Enquanto todo mundo vende para os pets...
            <span className="mt-4 block text-leaf">Quem está vendendo para quem ama os pets?</span>
          </h1>
          <div className="mt-8 grid gap-4 text-lg leading-8 text-ink/70 sm:text-xl">
            <p>Existe um público apaixonado por pets procurando mais do que ração, brinquedos e acessórios.</p>
            <p>A Coleção Pets e Tal ajuda empresas a criar um espaço exclusivo para quem ama animais e procuram presentes, decoração e produtos cheios de personalidade.</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-bold text-white transition hover:bg-leaf" href="#collection">
              Conhecer a Coleção
            </a>
            <a className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf" href="#final-cta">
              Quero ser parceiro
            </a>
          </div>
        </div>
        <PlaceholderImage className="aspect-[4/5] lg:aspect-[1.03/1]" image={landingImageSlots.hero} sizes="(min-width: 1024px) 54vw, 100vw" />
      </div>
    </section>
  );
}