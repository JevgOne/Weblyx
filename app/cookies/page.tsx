import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zásady cookies",
  description: "Informace o používání cookies na webu Weblyx. Zjistěte, jaké cookies používáme a jak můžete spravovat své preference.",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Zásady cookies</h1>
            <p className="text-lg text-muted-foreground">
              Poslední aktualizace: {new Date().toLocaleDateString("cs-CZ")}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Co jsou cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení (počítač,
              tablet, smartphone) při návštěvě webových stránek. Cookies pomáhají webovým stránkám
              fungovat efektivněji a poskytovat lepší uživatelskou zkušenost.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Jaké cookies používáme?</h2>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="border-l-4 border-primary pl-6 space-y-2">
                <h3 className="text-xl font-semibold">1. Nezbytné cookies</h3>
                <p className="text-muted-foreground">
                  Tyto cookies jsou nezbytné pro správné fungování našich webových stránek.
                  Bez těchto cookies by některé funkce webu nefungovaly správně.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">Příklady použití:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Zapamatování vašich preferencí cookies</li>
                    <li>Bezpečnostní funkce</li>
                    <li>Základní funkčnost webu</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2">
                    <strong>Doba platnosti:</strong> 365 dní<br />
                    <strong>Název cookie:</strong> cookie-consent
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-blue-500 pl-6 space-y-2">
                <h3 className="text-xl font-semibold">2. Analytické cookies</h3>
                <p className="text-muted-foreground">
                  Tyto cookies nám pomáhají pochopit, jak návštěvníci používají naše webové stránky.
                  Informace jsou anonymní a používáme je ke zlepšení funkčnosti a obsahu webu.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">Příklady použití:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Počet návštěvníků webu</li>
                    <li>Nejnavštěvovanější stránky</li>
                    <li>Doba strávená na webu</li>
                    <li>Zdroj návštěvnosti (odkud návštěvníci přicházejí)</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2">
                    <strong>Služby třetích stran:</strong> Google Analytics (pokud je povoleno)
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border-l-4 border-purple-500 pl-6 space-y-2">
                <h3 className="text-xl font-semibold">3. Marketingové cookies</h3>
                <p className="text-muted-foreground">
                  Tyto cookies se používají k zobrazení relevantních reklam a marketingových
                  kampaní na základě vašich preferencí a chování na webu.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">Příklady použití:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Zobrazení relevantních reklam</li>
                    <li>Měření efektivity reklamních kampaní</li>
                    <li>Remarketing</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2">
                    <strong>Služby třetích stran:</strong> Facebook Pixel, Google Ads (pokud je povoleno)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Jak spravovat cookies?</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Své preference cookies můžete kdykoli změnit pomocí našeho cookie nastavení,
                které se zobrazí při první návštěvě webu. Pokud chcete změnit nastavení později,
                můžete vymazat cookies ve svém prohlížeči a znovu navštívit náš web.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold">Nastavení v prohlížeči:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Google Chrome:</strong> Nastavení → Ochrana soukromí a zabezpečení →
                    Soubory cookie a další data webů
                  </li>
                  <li>
                    <strong>Mozilla Firefox:</strong> Nastavení → Soukromí a zabezpečení →
                    Cookies a data stránek
                  </li>
                  <li>
                    <strong>Safari:</strong> Předvolby → Soukromí → Cookies a data webových stránek
                  </li>
                  <li>
                    <strong>Microsoft Edge:</strong> Nastavení → Cookies a oprávnění webu →
                    Cookies a uložená data
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Služby třetích stran</h2>
            <p className="text-muted-foreground leading-relaxed">
              Na našem webu můžeme používat následující služby třetích stran, které mohou
              ukládat vlastní cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Google Analytics:</strong> Analýza návštěvnosti webu</li>
              <li><strong>Google Fonts:</strong> Optimalizované písma pro lepší čitelnost</li>
              <li><strong>Vercel Analytics:</strong> Monitoring výkonu webu</li>
            </ul>
          </section>

          {/* Updates */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Aktualizace zásad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tyto zásady cookies můžeme čas od času aktualizovat. Veškeré změny budou
              zveřejněny na této stránce s aktualizovaným datem.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pokud máte jakékoli dotazy ohledně našich zásad cookies, neváhejte nás kontaktovat:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">info@weblyx.cz</a></p>
              <p><strong>Telefon:</strong> <a href="tel:+420702110166" className="text-primary hover:underline">+420 702 110 166</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
