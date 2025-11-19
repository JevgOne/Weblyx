import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, DollarSign, Shield } from "lucide-react";

export function CTASection() {
  const benefits = [
    {
      icon: Clock,
      title: "24h Odpověď",
      description: "na poptávku",
    },
    {
      icon: DollarSign,
      title: "0 Kč Poplatek",
      description: "za konzultaci",
    },
    {
      icon: Shield,
      title: "100% Bez závazků",
      description: "nezávazná nabídka",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 lg:p-16 text-center text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 grid-pattern opacity-10"></div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Připraveni na nový web?
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Stačí vyplnit formulář a my se vám ozveme do 24 hodin s konkrétní nabídkou
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur rounded-xl p-6 space-y-2"
                >
                  <benefit.icon className="h-8 w-8 mx-auto mb-3" />
                  <div className="font-semibold text-lg">{benefit.title}</div>
                  <div className="text-sm text-white/80">
                    {benefit.description}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-base shadow-lg"
              >
                <Link href="/poptavka">
                  Začít projekt
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Link href="/kontakt">Kontaktovat nás</Link>
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
