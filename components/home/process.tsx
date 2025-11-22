import * as LucideIcons from "lucide-react";
import { ProcessSection, ProcessStep } from "@/types/cms";
import { getProcessSection, getAllProcessSteps } from "@/lib/turso/cms";

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

  // Filter enabled steps
  const enabledSteps = steps.filter(step => step.enabled);

  if (!section || !section.enabled || enabledSteps.length === 0) {
    return null;
  }

  // Helper to get icon component
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return Icon;
  };

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {section.subheading}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {enabledSteps.map((step, index) => {
            const IconComponent = getIcon(step.icon);
            const isLastInRow = (index + 1) % 3 === 0;
            return (
              <div key={step.id} className="relative group">
                {/* Connector Line (desktop only, not on last item in row) */}
                {index < enabledSteps.length - 1 && !isLastInRow && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-border -z-10">
                    <div className="h-full w-0 bg-primary group-hover:w-full transition-all duration-500"></div>
                  </div>
                )}

                <div className="space-y-4 h-full flex flex-col">
                  {/* Icon & Number */}
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg md:text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
