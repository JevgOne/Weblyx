import { MessageSquare, Palette, Code, TestTube, Rocket, HeadphonesIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { ProcessSection, ProcessStep } from "@/types/cms";
import { getProcessSection, getAllProcessSteps } from "@/lib/turso/cms";

const iconMap: Record<string, any> = {
  MessageSquare,
  Palette,
  Code,
  TestTube,
  Rocket,
  HeadphonesIcon,
};

async function getProcessData(): Promise<{ section: ProcessSection | null; steps: ProcessStep[] }> {
  try {
    const [section, steps] = await Promise.all([
      getProcessSection(),
      getAllProcessSteps()
    ]);

    return {
      section,
      steps: steps || []
    };
  } catch (error) {
    console.error('Error fetching process data:', error);
    return { section: null, steps: [] };
  }
}

export async function Process() {
  const { section, steps } = await getProcessData();

  // Fallback values
  const sectionData = section || {
    enabled: true,
    heading: "Jak to funguje",
    subheading: "Náš proces je jednoduchý, transparentní a efektivní",
  };

  if (!sectionData.enabled) return null;

  // Filter enabled steps
  const enabledSteps = steps.filter(step => step.enabled);

  // Helper to get icon component
  const getIcon = (iconName: string) => {
    return iconMap[iconName] || (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{sectionData.heading}</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionData.subheading}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {enabledSteps.map((step) => {
            const IconComponent = getIcon(step.icon);
            return (
              <div
                key={step.id}
                className="relative p-6 md:p-8 rounded-xl bg-card border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                {/* Number badge - better positioning for mobile */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                  <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
                    {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
