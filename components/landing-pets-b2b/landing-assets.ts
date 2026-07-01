export type LandingImageSlot = {
  alt: string;
  priority?: boolean;
  slot: string;
  src: string;
};

export const landingImageSlots = {
  hero: {
    alt: "Espaço editorial elegante preparado para a Coleção Pets e Tal",
    priority: true,
    slot: "hero",
    src: "/landing-pets-b2b/placeholders/editorial-store.svg"
  },
  market: {
    alt: "Composição visual para dados do mercado pet",
    slot: "market",
    src: "/landing-pets-b2b/placeholders/market-story.svg"
  },
  discovery: {
    alt: "Área visual preparada para provas sociais da Pets e Tal",
    slot: "discovery",
    src: "/landing-pets-b2b/placeholders/discovery-proof.svg"
  },
  collection: {
    alt: "Placeholder para fotografia real da Coleção Pets e Tal",
    slot: "collection",
    src: "/landing-pets-b2b/placeholders/collection-card.svg"
  },
  space: {
    alt: "Conceito de pequeno espaço Pets e Tal dentro de uma loja",
    slot: "space",
    src: "/landing-pets-b2b/placeholders/space-concept.svg"
  }
} satisfies Record<string, LandingImageSlot>;