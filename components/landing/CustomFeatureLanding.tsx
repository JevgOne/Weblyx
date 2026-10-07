import { Check, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebPageSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/schema-org";
import { LandingFaq, type Faq } from "@/components/landing/LandingFaq";
import { LandingForm } from "@/components/landing/LandingForm";
import { StickyCta } from "@/components/landing/StickyCta";
import { CallLink } from "@/components/landing/CallLink";
import { countPublishedProjects, getRatingStat, projectsLabel } from "@/lib/site-stats";

/**
 * The page behind each item of the homepage's "Funkce na míru" block.
 *
 * These pages describe systems we built for clients who are not named, so the
 * only thing they can argue from is what the system does. Every line in
 * `groups` is a function that exists in delivered code — not a capability we
 * could build. What we could build belongs in the closing paragraph, said as
 * such.
 *
 * There is no price table: custom work is quoted by scope, and a "from" figure
 * here would be a number nobody can hold us to.
 */
export interface FeatureGroup {
  /** Shaped like a question, as the other landing pages' headings are. */
  title: string;
  /** Anchor for links that point at one group, e.g. from the homepage. */
  id?: string;
  intro?: string;
  items: string[];
}

export interface CustomFeatureContent {
  path: string;
  label: string;
  h1: string;
  lead: string;
  why: { heading: string; paragraphs: string[] };
  groups: FeatureGroup[];
  closing: string;
  formHeading: string;
  faq: Faq[];
  schemaDescription: string;
  lastUpdated: string;
}

const STEPS = [
  { n: "1", title: "Úvodní hovor", body: "Projdeme, jak dnes pracujete a co vás na tom zdržuje. Nezávazně a zdarma." },
  { n: "2", title: "Návrh a cena", body: "Dostanete seznam funkcí a pevnou cenu za ně. Cena se řídí rozsahem." },
  { n: "3", title: "Vývoj a předání", body: "Termín dostanete v nabídce spolu s cenou. Po schválení návrhu záloha 50 %." },
];

export async function CustomFeatureLanding({ content }: { content: CustomFeatureContent }) {
  const projects = projectsLabel(await countPublishedProjects("cs"));
  const rating = await getRatingStat("cs");
  const url = `https://www.weblyx.cz${content.path}`;

  const breadcrumbs = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: content.label, url },
  ];

  return (
    <>
      <JsonLd
        data={generateWebPageSchema({
          name: content.h1,
          description: content.schemaDescription,
          url,
          breadcrumbs,
          dateModified: content.lastUpdated,
        })}
      />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={generateOrganizationSchema({ locale: "cs" })} />

      <main className="min-h-screen pb-24 md:pb-0">
        <Breadcrumbs items={[{ label: content.label, href: content.path }]} />

        <section className="px-4 pt-10 pb-12 md:pt-16">
          <div className="container mx-auto max-w-3xl space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{content.h1}</h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{content.lead}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              {rating && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  {rating.value} · {rating.label}
                </span>
              )}
              <span className="text-muted-foreground">{projects} dokončených projektů</span>
            </div>
            <a
              href="#poptavka"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Probrat, co potřebujete
            </a>
          </div>
        </section>

        <section className="border-y bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">{content.why.heading}</h2>
            {content.why.paragraphs.map((p) => (
              <p key={p} className="mb-4 leading-relaxed text-muted-foreground last:mb-0">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="container mx-auto max-w-4xl">
            <div className="grid gap-5 md:grid-cols-2">
              {content.groups.map((group) => (
                <Card key={group.title} id={group.id} className="scroll-mt-24 border-border/60">
                  <CardContent className="space-y-4 p-6">
                    <h2 className="text-xl font-bold">{group.title}</h2>
                    {group.intro && (
                      <p className="text-sm leading-relaxed text-muted-foreground">{group.intro}</p>
                    )}
                    <ul className="space-y-2.5 text-sm">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-3xl text-center leading-relaxed text-muted-foreground">
              {content.closing}
            </p>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Jak spolupráce probíhá?</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {STEPS.map((s) => (
                <Card key={s.n} className="border-border/60">
                  <CardContent className="space-y-2.5 p-6">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {s.n}
                    </span>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t px-4 py-14">
          <div className="container mx-auto max-w-2xl scroll-mt-24" id="poptavka">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Kolik to bude stát u vás?</h2>
              <p className="mt-2 text-muted-foreground">
                Cena se řídí rozsahem. Napište nám, co potřebujete, nebo volejte{" "}
                <CallLink className="font-semibold text-primary hover:underline" />.
              </p>
            </div>
            <LandingForm
              source={content.path}
              defaultType="other"
              heading={content.formHeading}
              note="Ozveme se do 24 hodin a domluvíme úvodní hovor."
            />
          </div>
        </section>

        <LandingFaq items={content.faq} />
      </main>

      <StickyCta />
    </>
  );
}
