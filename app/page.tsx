export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden gradient-hero grid-pattern">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Moderní weby za ceny,{" "}
              <span className="text-primary">které vás překvapí</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Profesionální webové stránky od 10 000 Kč • Dodání za 5-7 dní • SEO optimalizace
            </p>
            <div className="pt-4">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-elegant">
                Nezávazná poptávka
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5-7 dní", label: "Rychlé dodání" },
              { value: "100%", label: "Spokojenost" },
              { value: "< 2s", label: "Rychlost načtení" },
              { value: "10+", label: "Projektů dokončeno" },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Temporary Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Weblyx. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </main>
  );
}
