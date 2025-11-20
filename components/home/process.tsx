import * as LucideIcons from "lucide-react";
import { getServerProcessSection, getServerProcessSteps } from "@/lib/firestore-server";

export async function Process() {
  const [section, stepsData] = await Promise.all([
    getServerProcessSection(),
    getServerProcessSteps(),
  ]);

  // Filter only enabled steps
  const steps = stepsData.filter((step) => step.enabled);

  if (!section || !section.enabled || steps.length === 0) {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = getIcon(step.icon);
            return (
              <div key={step.id} className="relative group">
                {/* Connector Line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-border -z-10">
                    <div className="h-full w-0 bg-primary group-hover:w-full transition-all duration-500"></div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Icon & Number */}
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
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
