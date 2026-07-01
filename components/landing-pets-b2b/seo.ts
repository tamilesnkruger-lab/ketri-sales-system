import type { Metadata } from "next";

const title = "Pets e Tal | Coleção B2B para empresas que querem encantar apaixonados por pets";
const description = "Uma landing page institucional para apresentar a Coleção Pets e Tal como oportunidade B2B para lojas, clínicas, pet shops e parceiros que desejam criar uma referência para quem ama pets.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ketricriativa.com";

export const petsB2BMetadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/pets-e-tal-b2b"
  },
  openGraph: {
    title,
    description,
    images: [
      {
        alt: "Coleção Pets e Tal para empresas parceiras",
        url: "/landing-pets-b2b/placeholders/editorial-store.svg"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/landing-pets-b2b/placeholders/editorial-store.svg"]
  }
};