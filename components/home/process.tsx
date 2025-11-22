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
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{sectionData.heading}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionData.subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {enabledSteps.map((step) => {
            const IconComponent = getIcon(step.icon);
            return (
              <div
                key={step.id}
                className="relative p-6 rounded-xl bg-card border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                <div className="pt-4">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                    {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
