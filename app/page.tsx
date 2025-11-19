import { Hero } from "@/components/home/hero";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { Portfolio } from "@/components/home/portfolio";
import { Pricing } from "@/components/home/pricing";
import { FAQ } from "@/components/home/faq";
import { CTASection } from "@/components/home/cta-section";
import { Contact } from "@/components/home/contact";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <Process />
      <Portfolio />
      <Pricing />
      <FAQ />
      <CTASection />
      <Contact />
    </main>
  );
}
