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
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Náš proces
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {sectionData.heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionData.subheading}
          </p>
        </div>

        {/* Process Steps - Desktop Timeline */}
        <div className="hidden lg:block max-w-7xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>

            <div className="grid grid-cols-3 gap-8">
              {enabledSteps.slice(0, 3).map((step, index) => {
                const IconComponent = getIcon(step.icon);
                return (
                  <div
                    key={step.id}
                    className="relative group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Number badge on timeline */}
                    <div className="flex justify-center mb-6">
                      <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-3xl shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                        {step.number}
                      </div>
                    </div>

                    {/* Card */}
                    <div className="relative p-8 rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[280px] flex flex-col">
                      {/* Icon */}
                      <div className="mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 w-fit group-hover:scale-110 transition-transform duration-300">
                        {IconComponent && <IconComponent className="h-8 w-8 text-primary" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Second row if more than 3 steps */}
            {enabledSteps.length > 3 && (
              <div className="grid grid-cols-3 gap-8 mt-8">
                {enabledSteps.slice(3, 6).map((step, index) => {
                  const IconComponent = getIcon(step.icon);
                  return (
                    <div
                      key={step.id}
                      className="relative group"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      {/* Card without timeline */}
                      <div className="relative p-8 rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 min-h-[280px] flex flex-col">
                        {/* Number + Icon in header */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30">
                            {step.number}
                          </div>
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                            {IconComponent && <IconComponent className="h-7 w-7 text-primary" />}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet - Vertical Timeline */}
        <div className="lg:hidden max-w-2xl mx-auto">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20 hidden sm:block"></div>

            <div className="space-y-8">
              {enabledSteps.map((step, index) => {
                const IconComponent = getIcon(step.icon);
                return (
                  <div
                    key={step.id}
                    className="relative group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex gap-6">
                      {/* Number badge */}
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30">
                          {step.number}
                        </div>
                      </div>

                      {/* Card */}
                      <div className="flex-1 p-6 rounded-xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        {/* Icon */}
                        <div className="mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                          {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
