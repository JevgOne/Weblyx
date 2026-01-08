"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    icon?: any;
    features?: string[];
    priceFrom?: number;
    priceTo?: number;
  };
  IconComponent: any;
}

export function ServiceCard({ service, IconComponent }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get features array - handle both array and undefined
  const features = Array.isArray(service.features) ? service.features : [];
  const hasFeatures = features.length > 0;
  const hasPrice = typeof service.priceFrom === 'number' && service.priceFrom > 0;

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          {hasPrice && (
            <Badge variant="secondary" className="text-sm font-semibold">
              od {service.priceFrom?.toLocaleString("cs-CZ")} Kč
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold">{service.title}</h3>
        <p className="text-muted-foreground text-sm">{service.description}</p>

        {/* Expandable Features */}
        {hasFeatures && (
          <>
            {isExpanded && (
              <ul className="space-y-2 pt-3 border-t">
                {features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm text-primary hover:underline w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Skrýt detaily
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Zobrazit detaily
                </>
              )}
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
