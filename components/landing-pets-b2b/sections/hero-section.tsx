import { landingImageSlots } from "../landing-assets";
import { PlaceholderImage } from "../placeholder-image";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#40167E] px-5 pb-16 pt-8 text-white sm:px-8 lg:px-10 lg:pb-24">
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-[52%_48%_40%_60%/58%_42%_58%_42%] bg-[#B6FF3B] opacity-80 blur-sm" />
      <div className="absolute right-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-[#FF7A2D]/70 blur-3xl" />
      <div className="absolute bottom-[-220px] left-1/3 h-[520px] w-[760px] rotate-[-8deg] rounded-[50%] bg-white/10" />
      <div className="relative mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="max-w-4xl py-10">
          <p className="mb-7 inline-flex rounded-full bg-[#B6FF3B] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#20142F] shadow-[0_18px_45px_rgba(182,255,59,0.32)]">Coleção Pets e Tal para empresas</p>
          <h1 className="text-5xl font-black leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            Enquanto todo mundo vende para os pets...
            <span className="mt-5 block text-[#B6FF3B] drop-shadow-[0_10px_0_rgba(32,20,47,0.26)]">Quem está vendendo para quem ama os pets?</span>
          </h1>
          <div className="mt-8 grid max-w-2xl gap-4 text-lg font-semibold leading-8 text-white/82 sm:text-xl">
            <p>Existe um público apaixonado por pets procurando mais do que ração, brinquedos e acessórios.</p>
            <p>A Coleção Pets e Tal ajuda empresas a criar um espaço exclusivo para quem ama animais e procuram presentes, decoração e produtos cheios de personalidade.</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex h-13 min-h-12 items-center justify-center rounded-full bg-[#B6FF3B] px-7 text-sm font-black text-[#20142F] shadow-[0_18px_45px_rgba(182,255,59,0.34)] transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="#collection">
              Conhecer a Coleção
            </a>
            <a className="inline-flex h-13 min-h-12 items-center justify-center rounded-full border-2 border-white px-7 text-sm font-black text-white transition hover:bg-white hover:text-[#40167E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="#final-cta">
              Quero ser parceiro
            </a>
          </div>
        </div>
        <div className="relative lg:-mr-20 xl:-mr-28">
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-[42%_58%_64%_36%/48%_42%_58%_52%] bg-[#B6FF3B]" />
          <div className="absolute -bottom-8 right-6 h-28 w-52 rotate-[-9deg] rounded-full bg-[#FF7A2D]" />
          <PlaceholderImage className="aspect-[4/5] min-h-[520px] rotate-[1deg] border-[10px] border-white/85 lg:aspect-[1.02/1] lg:min-h-[680px]" image={landingImageSlots.hero} sizes="(min-width: 1024px) 62vw, 100vw" />
        </div>
      </div>
    </section>
  );
}