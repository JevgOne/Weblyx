import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadButton } from "@/components/tracking/LeadButton";
import { ArrowRight } from "lucide-react";
import { CTASection as CTASectionType } from "@/types/cms";
import { getCTASection } from "@/lib/turso/cms";
import { getIcon } from "@/lib/icon-map";

async function getCTAData(): Promise<CTASectionType | null> {
  try {
    const section = await getCTASection();
    return section;
  } catch (error) {
    console.error('Error fetching CTA data:', error);
    return null;
  }
}

export async function CTASection() {
  const section = await getCTAData();

  if (!section || !section.enabled) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 lg:p-16 text-center text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-10"></div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {section.heading}
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                {section.subheading}
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {section.benefits.map((benefit, index) => {
                const IconComponent = getIcon(benefit.icon);
                return (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur rounded-xl p-6 space-y-2"
                  >
                    <IconComponent className="h-8 w-8 mx-auto mb-3" />
                    <div className="font-semibold text-lg">{benefit.title}</div>
                    <div className="text-sm text-white/80">
                      {benefit.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {/* Primary CTA with Facebook Pixel Lead tracking */}
              <LeadButton
                href={section.primaryButtonLink}
                size="lg"
                variant="secondary"
                className="text-base shadow-lg"
              >
                {section.primaryButtonText}
              </LeadButton>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Link href={section.secondaryButtonLink}>{section.secondaryButtonText}</Link>
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
