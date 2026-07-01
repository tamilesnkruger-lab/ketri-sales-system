const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pets e Tal",
  brand: "Pets e Tal",
  parentOrganization: {
    "@type": "Organization",
    name: "Ketri Criativa"
  }
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Pets e Tal",
  description: "Coleção B2B para empresas que desejam criar uma referência para apaixonados por pets.",
  parentOrganization: {
    "@type": "Organization",
    name: "Ketri Criativa"
  }
};

export function LandingStructuredData() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        type="application/ld+json"
      />
    </>
  );
}