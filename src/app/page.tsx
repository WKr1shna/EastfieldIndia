import React from "react";
import { Header } from "@/components/navigation/Header";
import { HeroSection } from "@/components/hero/HeroSection";
import { BrandPromiseStrip } from "@/components/ui/BrandPromiseStrip";
import { WhoWeAreSection } from "@/components/sections/WhoWeAreSection";
import { SourcingRegionSection } from "@/components/sections/SourcingRegionSection";
import { FounderStorySection } from "@/components/sections/FounderStorySection";
import { WhyMakhanaSection } from "@/components/sections/WhyMakhanaSection";
import { MakhanaGradesSection } from "@/components/sections/MakhanaGradesSection";
import { B2BBuyersSection } from "@/components/sections/B2BBuyersSection";
import { QualitySection } from "@/components/sections/QualitySection";
import { ProcurementSection } from "@/components/sections/ProcurementSection";
import { InquiryFormSection } from "@/components/forms/InquiryFormSection";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { WelcomeLeadModal } from "@/components/forms/WelcomeLeadModal";
import { Footer } from "@/components/footer/Footer";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    taxID: siteConfig.gstin,
    address: {
      "@type": "PostalAddress",
      addressRegion: "Bihar",
      addressCountry: "IN",
    },
    areaServed: ["IN", "Global"],
    founder: {
      "@type": "Person",
      name: siteConfig.founder.name,
      sameAs: siteConfig.founder.linkedinUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main id="main-content">
        <HeroSection />
        <BrandPromiseStrip />
        <WhoWeAreSection />
        <SourcingRegionSection />
        <FounderStorySection />
        <WhyMakhanaSection />
        <MakhanaGradesSection />
        <B2BBuyersSection />
        <QualitySection />
        <ProcurementSection />
        <InquiryFormSection />
      </main>
      <Footer />
      <WelcomeLeadModal />
      <SampleRequestModal />
    </>
  );
}
