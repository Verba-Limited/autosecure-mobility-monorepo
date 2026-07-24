import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { WhatWeOffer } from "@/components/landing/WhatWeOffer";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { FeaturedCars } from "@/components/landing/FeaturedCars";
import { WhyAutoSecure } from "@/components/landing/WhyAutoSecure";
import { SupplierCta } from "@/components/landing/SupplierCta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <WhatWeOffer />
        <ProcessSteps />
        <FeaturedCars />
        <WhyAutoSecure />
        <SupplierCta />
      </main>
      <Footer />
    </>
  );
}
