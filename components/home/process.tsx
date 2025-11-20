"use client";

import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";

interface ProcessStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

interface ProcessSection {
  enabled: boolean;
  heading: string;
  subheading: string;
}

export function Process() {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [section, setSection] = useState<ProcessSection | null>(null);

  useEffect(() => {
    // In development with mock data, we can use fallback data
    const mockSection: ProcessSection = {
      enabled: true,
      heading: "Jak to funguje",
      subheading: "Náš proces je jednoduchý, transparentní a efektivní"
    };

    const mockSteps: ProcessStep[] = [
      {
        id: "1",
        number: 1,
        title: "Konzultace",
        description: "Nezávazná konzultace zdarma, kde si vyslechneme vaše požadavky a cíle.",
        icon: "MessageCircle",
        enabled: true
      },
      {
        id: "2",
        number: 2,
        title: "Návrh designu",
        description: "Vytvoříme moderní design odpovídající vaší značce a cílové skupině.",
        icon: "Palette",
        enabled: true
      },
      {
        id: "3",
        number: 3,
        title: "Vývoj",
        description: "Naprogramujeme web s využitím nejnovějších technologií a best practices.",
        icon: "Code",
        enabled: true
      },
      {
        id: "4",
        number: 4,
        title: "Testování",
        description: "Důkladně otestujeme všechny funkce, responzivitu a rychlost načítání.",
        icon: "TestTube",
        enabled: true
      },
      {
        id: "5",
        number: 5,
        title: "Spuštění",
        description: "Zveřejníme váš web na internetu a zajistíme bezproblémový start.",
        icon: "Rocket",
        enabled: true
      },
      {
        id: "6",
        number: 6,
        title: "Podpora",
        description: "Poskytujeme následnou podporu, aktualizace a údržbu vašeho webu.",
        icon: "HeadphonesIcon",
        enabled: true
      }
    ];

    setSection(mockSection);
    setSteps(mockSteps.filter(step => step.enabled));
  }, []);

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

        <div className="relative">
          {/* Connector Lines - Only visible on desktop */}
          <div className="hidden lg:block absolute top-[32px] left-0 right-0 h-0.5 pointer-events-none">
            {steps.map((_, index) => {
              if (index >= steps.length - 1) return null;

              const startPercent = (index / (steps.length - 1)) * 100;
              const endPercent = ((index + 1) / (steps.length - 1)) * 100;
              const widthPercent = endPercent - startPercent;

              return (
                <div
                  key={`line-${index}`}
                  className="absolute top-0 h-0.5"
                  style={{
                    left: `calc(${startPercent}% + 32px)`,
                    width: `calc(${widthPercent}% - 64px)`,
                  }}
                >
                  <div className="h-full bg-border relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-primary"
                      style={{
                        animation: `slideIn 2s ease-in-out ${index * 0.2}s infinite`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step) => {
              const IconComponent = getIcon(step.icon);
              return (
                <div key={step.id} className="relative group">
                  <div className="space-y-4">
                    {/* Icon & Number */}
                    <div className="relative">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
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
      </div>

      <style jsx>{`
        @keyframes slideIn {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
