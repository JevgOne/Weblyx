import { ProcessSection, ProcessStep } from "@/types/cms";
import { getProcessSection, getAllProcessSteps } from "@/lib/turso/cms";
import { getIcon } from "@/lib/icon-map";
import { getTranslations, getLocale } from 'next-intl/server';
import { LeadButton } from "@/components/tracking/LeadButton";

async function getProcessData(locale?: string): Promise<{ section: ProcessSection | null; steps: ProcessStep[] }> {
  try {
    const [section, steps] = await Promise.all([
      getProcessSection(locale),
      getAllProcessSteps(locale)
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
  const locale = await getLocale();
  const { section, steps } = await getProcessData(locale);

  // Filter enabled steps
  const enabledSteps = steps.filter(step => step.enabled);

  if (!section || !section.enabled || enabledSteps.length === 0) {
    return null;
  }

  return (
    <section className="section px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="eyebrow">{t('badge')}</p>
          <h2 className="display display-lg mt-5">{section.heading}</h2>
          <p className="lede mt-5">{section.subheading}</p>
        </div>

        {/* Steps — the step number does the sequencing work, so the cards
            themselves stay quiet: one hairline, no glow, no lift. */}
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enabledSteps.map((step) => {
            const IconComponent = getIcon(step.icon);
            return (
              <div key={step.id} className="card-flat card-flat-accent h-full p-7">
                <div className="flex items-center justify-between">
                  <span className="icon-mark">
                    <IconComponent className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="numeral text-4xl font-bold text-[hsl(var(--hairline-strong))] leading-none">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[hsl(var(--ink-soft))]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4">
          <LeadButton
            href={locale === 'de' ? '/anfrage' : '/poptavka'}
            size="lg"
            className="h-12 px-7 text-base font-semibold rounded-xl shrink-0"
          >
            {locale === 'de' ? 'Kostenlose Erstberatung' : 'Začít s nezávaznou konzultací'}
          </LeadButton>
          <p className="text-sm text-[hsl(var(--ink-faint))]">
            {t('bottomHint')}
          </p>
        </div>
      </div>
    </section>
  );
}
