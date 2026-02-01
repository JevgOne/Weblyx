import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PageSpeed Garance 90+ | Weblyx",
  description: "Detailní podmínky naší garance rychlosti načítání PageSpeed 90+ nebo vrácení peněz.",
};

export default function PageSpeedGuaranteePage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg">
        <h1>Podmínky PageSpeed Garance 90+</h1>
        <p className="lead">
          Zaručujeme PageSpeed skóre 90+ pro váš web nebo vám vrátíme peníze.
          Přečtěte si detailní podmínky této garance.
        </p>

        <h2>1. Co je PageSpeed?</h2>
        <p>
          PageSpeed (Google PageSpeed Insights) je nástroj od společnosti Google, který měří rychlost
          načítání webových stránek a hodnotí je skórem 0-100. Vyšší skóre znamená rychlejší načítání
          a lepší uživatelskou zkušenost.
        </p>
        <p>
          <strong>Odkaz na nástroj:</strong>{" "}
          <a
            href="https://pagespeed.web.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            pagespeed.web.dev
          </a>
        </p>

        <h2>2. Jak měříme PageSpeed?</h2>
        <p>PageSpeed skóre měříme následovně:</p>
        <ul>
          <li>
            <strong>Nástroj:</strong> Google PageSpeed Insights (pagespeed.web.dev)
          </li>
          <li>
            <strong>Testované stránky:</strong> Domovská stránka (homepage) ve výchozím stavu
          </li>
          <li>
            <strong>Zařízení:</strong> Mobilní verze (Mobile Performance Score)
          </li>
          <li>
            <strong>Čas měření:</strong> Do 7 dnů po spuštění webu
          </li>
        </ul>

        <h2>3. Podmínky pro uplatnění garance</h2>
        <p>Garance PageSpeed 90+ platí při splnění následujících podmínek:</p>

        <h3>3.1 Rozsah garance</h3>
        <ul>
          <li>Garance se vztahuje na <strong>základní webové stránky</strong> (balíček od 10 000 Kč)</li>
          <li>Měří se <strong>domovská stránka</strong> ve stavu, v jakém byla předána klientovi</li>
          <li>Platí pro <strong>mobilní verzi</strong> webu (Mobile Performance Score)</li>
        </ul>

        <h3>3.2 Co je zahrnuto v garanci</h3>
        <ul>
          <li>Optimalizace kódu a obrázků dodaných námi</li>
          <li>Správná konfigurace cachování a komprese</li>
          <li>Použití moderních webových technologií (Next.js)</li>
          <li>Optimalizace renderování a načítání prostředků</li>
        </ul>

        <h3>3.3 Co není zahrnuto v garanci</h3>
        <p>Garance <strong>NEPLATÍ</strong> v následujících případech:</p>
        <ul>
          <li>
            <strong>Dodatečné úpravy klientem:</strong> Pokud klient přidal vlastní kód, skripty
            (např. tracking, reklamy) nebo neoptimalizované obrázky
          </li>
          <li>
            <strong>Externí služby:</strong> Zapojení služeb třetích stran (Facebook Pixel, Google Analytics,
            live chat widgety, reklamní systémy apod.), které zpomalují načítání
          </li>
          <li>
            <strong>Velké multimediální soubory:</strong> Nahrání velkých videí přímo na web nebo
            neoptimalizovaných obrázků ve vysokém rozlišení
          </li>
          <li>
            <strong>Nestandardní funkcionalita:</strong> E-shopy, rezervační systémy a pokročilé funkce
            (měří se zvlášť, jiná pravidla)
          </li>
          <li>
            <strong>Hosting a infrastruktura:</strong> Problémy s hostingem nebo doménou mimo náš vliv
            (např. pomalý hosting zvolený klientem)
          </li>
          <li>
            <strong>Změny v algoritmu Google:</strong> Pokud Google změní způsob měření PageSpeed
            po spuštění webu
          </li>
        </ul>

        <h2>4. Jak uplatnit garanci?</h2>
        <p>Pokud váš web nedosáhne PageSpeed 90+ po spuštění:</p>
        <ol>
          <li>Kontaktujte nás emailem na <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">info@weblyx.cz</a></li>
          <li>Uveďte URL vašeho webu a screenshot z PageSpeed Insights</li>
          <li>
            Ověříme, že se jedná o výchozí stav webu bez dodatečných úprav (viz bod 3.3)
          </li>
          <li>
            Pokud jsou splněny podmínky garance, máme <strong>7 pracovních dní</strong> na optimalizaci
          </li>
          <li>
            Pokud optimalizace nepomůže a skóre zůstane pod 90, vrátíme vám{" "}
            <strong>100% zaplacené částky</strong>
          </li>
        </ol>

        <h2>5. Lhůta pro uplatnění</h2>
        <ul>
          <li>Garance platí <strong>do 14 dní po spuštění webu</strong></li>
          <li>Po této lhůtě již garance neplatí (možnost dodatečných úprav klientem)</li>
        </ul>

        <h2>6. Průměrné výsledky</h2>
        <p>Naše weby dosahují v průměru následujících skóre:</p>
        <ul>
          <li><strong>Performance:</strong> 92-98/100 (mobilní verze)</li>
          <li><strong>Accessibility:</strong> 95-100/100</li>
          <li><strong>Best Practices:</strong> 90-100/100</li>
          <li><strong>SEO:</strong> 95-100/100</li>
        </ul>

        <h2>7. Kontakt</h2>
        <p>
          V případě dotazů ohledně PageSpeed garance nás můžete kontaktovat:
          <br />
          Email: <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">info@weblyx.cz</a>
          <br />
          Telefon: <a href="tel:+420702110166" className="text-primary hover:underline">+420 702 110 166</a>
        </p>

        <div className="mt-12 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
          <p className="!mb-0 text-sm">
            <strong>Poslední aktualizace:</strong> 8. prosince 2025
            <br />
            <strong>Účinnost:</strong> Pro všechny smlouvy uzavřené od 1. ledna 2025
          </p>
        </div>
      </div>
    </main>
  );
}
