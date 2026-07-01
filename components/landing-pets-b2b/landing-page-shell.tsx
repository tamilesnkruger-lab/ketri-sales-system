import { CollectionSection } from "./sections/collection-section";
import { DiscoverySection } from "./sections/discovery-section";
import { FinalCtaSection } from "./sections/final-cta-section";
import { HeroSection } from "./sections/hero-section";
import { HowItWorksSection } from "./sections/how-it-works-section";
import { MarketSection } from "./sections/market-section";
import { OpportunitySection } from "./sections/opportunity-section";
import { SpaceSection } from "./sections/space-section";
import { LandingStructuredData } from "./structured-data";

export function LandingPageShell() {
  return (
    <>
      <LandingStructuredData />
      <main className="min-h-screen bg-white text-ink">
        <HeroSection />
        <OpportunitySection />
        <MarketSection />
        <DiscoverySection />
        <CollectionSection />
        <HowItWorksSection />
        <SpaceSection />
        <FinalCtaSection />
      </main>
    </>
  );
}