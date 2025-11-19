import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | Weblyx",
  description: "Zásady ochrany osobních údajů a GDPR compliance.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg">
        <h1>Ochrana osobních údajů</h1>
        <p className="lead">Poslední aktualizace: 19. listopadu 2025</p>

        <h2>1. Správce osobních údajů</h2>
        <p>
          Správcem vašich osobních údajů je Weblyx, se sídlem v České republice.
        </p>

        <h2>2. Jaké údaje sbíráme</h2>
        <p>Při používání našich služeb můžeme sbírat následující osobní údaje:</p>
        <ul>
          <li>Jméno a příjmení</li>
          <li>Emailovou adresu</li>
          <li>Telefonní číslo</li>
          <li>Informace o vašem projektu z kontaktního formuláře</li>
          <li>Technické údaje (IP adresa, typ prohlížeče) prostřednictvím cookies</li>
        </ul>

        <h2>3. Účel zpracování</h2>
        <p>Vaše osobní údaje zpracováváme za následujícími účely:</p>
        <ul>
          <li>Odpověď na vaše dotazy a poptávky</li>
          <li>Zpracování objednávek a komunikace ohledně projektů</li>
          <li>Zlepšování našich služeb a webových stránek</li>
          <li>Zasílání marketingových sdělení (pouze se souhlasem)</li>
        </ul>

        <h2>4. Právní základ zpracování</h2>
        <p>Osobní údaje zpracováváme na základě:</p>
        <ul>
          <li>Vašeho souhlasu</li>
          <li>Plnění smlouvy</li>
          <li>Našich oprávněných zájmů</li>
          <li>Právních povinností</li>
        </ul>

        <h2>5. Doba uchování</h2>
        <p>
          Osobní údaje uchováváme po dobu nezbytnou pro splnění účelů, pro které byly získány,
          nebo po dobu stanovenou zákonem (obvykle 5 let pro daňové účely).
        </p>

        <h2>6. Vaše práva</h2>
        <p>V souvislosti se zpracováním osobních údajů máte následující práva:</p>
        <ul>
          <li>Právo na přístup k osobním údajům</li>
          <li>Právo na opravu</li>
          <li>Právo na výmaz (&quot;právo být zapomenut&quot;)</li>
          <li>Právo na omezení zpracování</li>
          <li>Právo na přenositelnost údajů</li>
          <li>Právo vznést námitku proti zpracování</li>
          <li>Právo odvolat souhlas</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          Naše webové stránky používají cookies pro zlepšení uživatelské zkušenosti a analytické
          účely. Více informací naleznete v naší Cookie Policy.
        </p>

        <h2>8. Kontakt</h2>
        <p>
          V případě dotazů ohledně ochrany osobních údajů nás můžete kontaktovat na:
          <br />
          Email: info@weblyx.cz
        </p>
      </div>
    </main>
  );
}
