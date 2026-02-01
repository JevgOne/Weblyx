import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const translations: Record<string, { title_de: string; description_de: string; features_de: string[] }> = {
  "o4cTsvEistGwuKp3LPeyZ": { // Webové stránky
    title_de: "Webseiten",
    description_de: "Wir erstellen moderne, responsive Webseiten – maßgeschneidert für Ihre Bedürfnisse und Zielgruppe. Next.js statt WordPress: schneller, sicherer, zukunftssicher.",
    features_de: ["Responsives Design (Mobil, Tablet, Desktop)", "Modernes und cleanes Design", "Grundlegende SEO-Optimierung", "Kontaktformular", "Google Analytics Integration", "Schnelle Ladezeit (< 2s)", "1 Monat kostenloser Support", "Schulung zur Website-Verwaltung"]
  },
  "1D0vccvyTgruZN03ujv1R": { // SEO optimalizace
    title_de: "SEO-Optimierung",
    description_de: "Erreichen Sie Top-Positionen in Suchmaschinen. Komplette On-Page und Off-Page SEO für bessere Sichtbarkeit und mehr organischen Traffic.",
    features_de: ["Keyword-Recherche", "On-Page-Optimierung", "Technisches SEO (Geschwindigkeit, Core Web Vitals)", "Content-Optimierung", "Meta-Tags und Structured Data", "Linkbuilding", "Monatliche Reports und Analytics", "Wettbewerbsanalyse"]
  },
  "ajUdf35Pm40YHS8m2DgjU": { // E-shopy
    title_de: "Onlineshops",
    description_de: "Komplette E-Commerce-Lösung für den Online-Verkauf mit Zahlungsintegration, Produktverwaltung und Bestellabwicklung.",
    features_de: ["Produktkatalog mit Varianten", "Warenkorb und Checkout", "Zahlungsgateways (GoPay, Stripe, PayPal)", "Versand (DHL, Hermes, DPD)", "Admin-Panel zur Verwaltung", "Lager- und Bestellverwaltung", "E-Mail-Benachrichtigungen", "SEO-Optimierung für Produkte", "6 Monate kostenloser Support"]
  },
  "wUamKwB94nXQHTC5QZ33_": { // Redesign
    title_de: "Redesign",
    description_de: "Modernisierung veralteter Websites. Neues Design, bessere UX, höhere Conversion – unter Beibehaltung Ihrer Markenidentität.",
    features_de: ["Analyse der bestehenden Website", "Neues modernes Design", "Verbesserung von UX/UI", "Optimierung für mobile Geräte", "Content-Migration", "SEO-Redirects", "Schnellere Ladezeit", "3 Monate kostenloser Support"]
  },
  "c8Tgwwkf3pdl_hyNr3hIN": { // Rychlost načítání
    title_de: "Ladegeschwindigkeit",
    description_de: "Website-Beschleunigung für besseres SEO und Nutzererlebnis. Ziel: Ladezeit unter 2 Sekunden. Lighthouse Score 95+ garantiert.",
    features_de: ["Performance-Audit", "Bildoptimierung", "CSS/JS-Minifizierung", "Lazy Loading", "Caching-Strategie", "CDN-Implementierung", "Core Web Vitals Optimierung", "Lighthouse Score > 90"]
  },
  "l2rDl3cejOmSdnLQwvwwJ": { // Údržba a podpora
    title_de: "Wartung & Support",
    description_de: "Regelmäßige Updates, Backups und technischer Support. Ihre Website bleibt immer funktionsfähig und sicher.",
    features_de: ["Regelmäßige Systemupdates", "Sicherheits-Backups", "Performance- und Verfügbarkeitsmonitoring", "Technischer Support (E-Mail, Telefon)", "Kleine Content-Änderungen", "Bugfixes", "Monatliche Reports", "Prioritäre Reaktion bei Problemen"]
  },
  "P1bF8wxMyySdfc061oWvd": { // Premium E-shop
    title_de: "Premium-Onlineshop",
    description_de: "Enterprise-Lösung zum halben Preis – skalierbarer Onlineshop mit allen Profi-Funktionen.",
    features_de: ["Unbegrenzte Produktanzahl", "Mehrere Zahlungsgateways", "Versanddienstleister-Anbindung", "Erweiterte Filter und Suche", "Benutzerkonten", "Gutscheine und Rabatte", "Produktbewertungen", "Mehrsprachig", "Buchhaltungs-Anbindung", "Lieferung in 21-28 Tagen", "12 Monate Premium-Support"]
  }
};

async function main() {
  for (const [id, t] of Object.entries(translations)) {
    await db.execute({
      sql: `UPDATE services SET title_de = ?, description_de = ?, features_de = ? WHERE id = ?`,
      args: [t.title_de, t.description_de, JSON.stringify(t.features_de), id]
    });
    console.log(`✅ ${t.title_de}`);
  }
  console.log("\n🎉 All remaining services translated!");
}
main();
