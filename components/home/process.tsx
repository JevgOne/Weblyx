import { ProcessSection, ProcessStep } from "@/types/cms";
import { getProcessSection, getAllProcessSteps } from "@/lib/turso/cms";
import { getIcon } from "@/lib/icon-map";
import { getTranslations } from 'next-intl/server';

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
  const t = await getTranslations('process');
  const { section, steps } = await getProcessData();

  // Filter enabled steps
  const enabledSteps = steps.filter(step => step.enabled);

  if (!section || !section.enabled || enabledSteps.length === 0) {
    return null;
  }

  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-10 -z-10"></div>

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span>{t('badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {section.subheading}
          </p>
        </div>

        {/* Modern step cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {enabledSteps.map((step, index) => {
            const IconComponent = getIcon(step.icon);
            return (
              <div
                key={step.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>

                {/* Card */}
                <div className="relative h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {/* Number badge - modern minimal */}
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{step.number}</span>
                  </div>

                  {/* Icon - larger, more prominent */}
                  <div className="mb-6 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-7 w-7 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA hint */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            {t('bottomHint')}
          </p>
        </div>
      </div>
    </section>
  );
}
