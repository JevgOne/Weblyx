import { Shield, Award, Clock, Ban } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SSL & Bezpečnost",
    description: "Vždy zabezpečený HTTPS"
  },
  {
    icon: Award,
    title: "Garance kvality",
    description: "PageSpeed 90+ nebo vrácení peněz"
  },
  {
    icon: Clock,
    title: "Dodání do 7 dní",
    description: "Nebo sleva 20%"
  },
  {
    icon: Ban,
    title: "Bez skrytých poplatků",
    description: "Transparentní ceník"
  }
];

export function TrustBadges() {
  return (
    <section className="py-12 px-4 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-3 p-4"
              >
                {/* Icon with border */}
                <div className="relative">
                  <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/30">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  {/* Checkmark badge */}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold">
                    {badge.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {badge.description}
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
