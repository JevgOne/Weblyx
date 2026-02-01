/**
 * Insert article #1: "Postavili jsme web za 3 dny — takhle to vypadalo hodinu po hodině"
 */

import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";
import { put } from "@vercel/blob";
import { readFileSync } from "fs";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const contentCS = `Klient napsal v pondělí. Ve čtvrtek měl hotový web. Žádné šablony, žádný WordPress — custom Next.js web od nuly. Takhle to celé probíhalo.

## Proč 3 dny?

Protože klient potřeboval web rychle. Přišel s jasnou představou: "Jsem fitness trenér, potřebuju web, kde se lidi můžou přihlásit na trénink. Nemám čas čekat 6 týdnů."

My jsme řekli: "Zvládneme to za 3 dny." A mysleli jsme to vážně.

## Den 1: Pondělí — Plánování a design (8 hodin)

### 8:00 — Vstupní brief (1 hodina)
Zavolali jsme si s klientem. 45 minut. Žádné zbytečné meetingy, žádné "workshopy na brand identity." Prostě: co potřebuješ, pro koho to je, co tam má být.

**Výstup:**
- Homepage s hero sekcí a CTA
- Stránka služeb (osobní tréninky, skupinové lekce, online coaching)
- O mně stránka s fotkou a příběhem
- Kontaktní formulář s výběrem typu tréninku
- Responzivní design, rychlý, SEO-ready

### 9:00–13:00 — Wireframe a design (4 hodiny)
Žádný Figma maraton. Wireframe přímo v kódu — Tailwind CSS + shadcn/ui komponenty. Proč? Protože je to rychlejší než kreslit pixely a pak je překládat do kódu.

Během oběda měl klient v mailu 3 screenshoty: hero sekce, služby, kontakt. Odpověděl za 15 minut: "Super, jen změňte barvu na tmavě zelenou."

### 14:00–18:00 — Základní struktura (4 hodiny)
- Next.js projekt inicializován
- Routing: 5 stránek
- Layout: header, footer, navigace
- Responzivní grid hotový
- Základní SEO: meta tagy, Open Graph, sitemap

**Stav na konci dne:** Kostra webu stojí. Vypadá to jako web, ale bez obsahu a bez funkčních formulářů.

## Den 2: Úterý — Vývoj a obsah (10 hodin)

### 8:00–12:00 — Funkce (4 hodiny)
- Kontaktní formulář s validací + napojení na email (Resend API)
- Výběr typu tréninku (dropdown s cenami)
- Google Maps embed na kontaktní stránce
- FAQ sekce s accordion komponentami
- Schema.org structured data (LocalBusiness, Person, FAQPage)

### 12:00–14:00 — Obsah od klienta
Klient poslal texty a fotky přes Google Drive. 12 fotek, 4 stránky textu. Kvalita? Smíšená — fotky super (profi focení), texty potřebovaly úpravu.

### 14:00–18:00 — Integrace obsahu + optimalizace (4 hodiny)
- Všechny texty přepsané a SEO-optimalizované
- Fotky komprimované (z 15 MB celkem na 2 MB)
- WebP konverze + responsive sizes
- Lazy loading na všechny obrázky pod foldem
- Core Web Vitals optimalizace: LCP, FID, CLS

### 18:00–20:00 — Bonus features (2 hodiny)
- Animace na scroll (Framer Motion — jemné, žádný Vegas)
- Dark mode toggle
- WhatsApp floating button
- Cookie consent banner (GDPR)

**Stav na konci dne:** Web je funkční. Vypadá hotově. Ale ještě není otestovaný.

## Den 3: Středa — Testing, deploy, launch (6 hodin)

### 8:00–10:00 — Testing (2 hodiny)
- Cross-browser testing: Chrome, Safari, Firefox, Edge
- Mobilní testování: iPhone, Android, tablet
- PageSpeed test: **96/100 mobile** 🔥
- Lighthouse audit: Performance 96, Accessibility 100, Best Practices 100, SEO 100
- Kontaktní formulář: 5× testovací odeslání

### 10:00–11:00 — Klientská revize (1 hodina)
Poslali jsme preview link. Klient prošel web na mobilu (protože jeho klienti jsou 90 % na mobilu). Feedback:
- "Změňte fotku na hero — chci tu z posilovny, ne tu venkovní"
- "Přidejte cenu za skupinový trénink"
- "Jinak super, jsem nadšený"

2 úpravy, 20 minut.

### 11:00–12:00 — Deploy a DNS (1 hodina)
- Vercel deploy (build prošel na první pokus)
- Custom doména připojená
- SSL certifikát automaticky
- Redirecty nastavené (www → non-www)
- Google Analytics + Search Console

### 12:00–14:00 — Předání a dokumentace (2 hodiny)
- Přístupy předané: Vercel, GitHub repo, Google Analytics, Search Console
- Krátký návod: jak upravit texty, přidat fotky
- Faktura odeslána

**Web je live.**

## Čísla

| Co | Hodnota |
|---|---|
| **Celkový čas** | 24 hodin práce |
| **Kalendářní dny** | 3 |
| **PageSpeed mobile** | 96/100 |
| **Počet stránek** | 5 |
| **Technologie** | Next.js, Tailwind, Vercel |
| **Cena** | 9 990 Kč |
| **Počet meetingů** | 2 (brief + revize) |
| **Počet revizí** | 1 (2 drobné změny) |

## Jak je to možné?

Žádná magie. Jen moderní stack a efektivní workflow:

1. **Next.js + Tailwind** — nepíšeme CSS od nuly, neladíme WordPress pluginy
2. **Komponentový přístup** — máme knihovnu ověřených komponent (hero, pricing, FAQ, contact form)
3. **Vercel deploy** — žádné FTP, žádné servery, deploy = git push
4. **Jasný brief** — klient věděl, co chce. To ušetřilo dny tam a zpět
5. **Žádné zbytečné features** — web dělá přesně to, co má. Nic víc, nic míň.

## Co kdybych chtěl totéž od "tradiční" agentury?

Reálný odhad:
- **Čas:** 4–8 týdnů
- **Meetingy:** 5–10 (brief, wireframe review, design review, development review, testing, launch)
- **Cena:** 40 000–80 000 Kč
- **PageSpeed:** 40–60/100 (WordPress + šablona)
- **Technologie:** WordPress + Elementor/Divi

Není to proto, že by ty agentury byly hloupé. Je to proto, že jejich workflow je postavený na technologiích z roku 2015. A workflow z roku 2015 vyžaduje čas z roku 2015.

## Závěr

Postavit web za 3 dny není výjimka — je to náš standard. Díky moderním technologiím dokážeme dodat rychle, kvalitně a za rozumnou cenu. Bez kompromisů na rychlosti, SEO nebo designu.

Pokud potřebujete web a nechcete čekat týdny — [ozvěte se nám](/poptavka). Možná vám taky řekneme "zvládneme to za 3 dny."

---

*Zajímá vás, kolik by stál váš web? [Kalkulačka ceny](/sluzby) vám dá odpověď za 30 sekund.*`;

const contentDE = `Der Kunde schrieb am Montag. Am Donnerstag hatte er eine fertige Website. Keine Templates, kein WordPress — eine Custom Next.js Website von Grund auf. So lief das Ganze ab.

## Warum 3 Tage?

Weil der Kunde seine Website schnell brauchte. Er kam mit einer klaren Vorstellung: "Ich bin Fitness-Trainer, ich brauche eine Website, auf der sich Leute für ein Training anmelden können. Ich habe keine Zeit, 6 Wochen zu warten."

Wir sagten: "Wir schaffen das in 3 Tagen." Und wir meinten es ernst.

## Tag 1: Montag — Planung und Design (8 Stunden)

### 8:00 — Briefing (1 Stunde)
45 Minuten Telefonat. Keine unnötigen Meetings, keine "Brand Identity Workshops." Einfach: Was brauchst du, für wen ist es, was soll drauf.

**Ergebnis:**
- Homepage mit Hero-Sektion und CTA
- Leistungsseite (Personal Training, Gruppenkurse, Online-Coaching)
- Über-mich-Seite mit Foto und Geschichte
- Kontaktformular mit Trainings-Auswahl
- Responsives Design, schnell, SEO-ready

### 9:00–13:00 — Wireframe und Design (4 Stunden)
Kein Figma-Marathon. Wireframe direkt im Code — Tailwind CSS + shadcn/ui Komponenten. Warum? Weil es schneller ist als Pixel zu zeichnen und sie dann in Code zu übersetzen.

Während der Mittagspause hatte der Kunde 3 Screenshots in der Mail: Hero-Sektion, Leistungen, Kontakt.

### 14:00–18:00 — Grundstruktur (4 Stunden)
- Next.js Projekt initialisiert
- Routing: 5 Seiten
- Layout: Header, Footer, Navigation
- Responsives Grid fertig

**Stand am Ende des Tages:** Das Gerüst der Website steht.

## Tag 2: Dienstag — Entwicklung und Inhalte (10 Stunden)

### 8:00–12:00 — Funktionen (4 Stunden)
- Kontaktformular mit Validierung + E-Mail-Anbindung
- Trainings-Auswahl (Dropdown mit Preisen)
- Google Maps auf der Kontaktseite
- FAQ-Sektion
- Schema.org Structured Data

### 14:00–18:00 — Content-Integration + Optimierung (4 Stunden)
- Alle Texte SEO-optimiert
- Fotos komprimiert (von 15 MB auf 2 MB)
- WebP-Konvertierung + responsive Größen
- Core Web Vitals Optimierung

### 18:00–20:00 — Bonus-Features (2 Stunden)
- Scroll-Animationen
- Dark Mode
- WhatsApp Floating Button
- Cookie-Consent (DSGVO)

## Tag 3: Mittwoch — Testing, Deploy, Launch (6 Stunden)

### 8:00–10:00 — Testing (2 Stunden)
- Cross-Browser: Chrome, Safari, Firefox, Edge
- Mobil: iPhone, Android, Tablet
- PageSpeed: **96/100 mobil** 🔥
- Lighthouse: Performance 96, Accessibility 100, Best Practices 100, SEO 100

### 10:00–12:00 — Deploy und DNS (2 Stunden)
- Vercel Deploy
- Custom Domain + SSL
- Google Analytics + Search Console

## Die Zahlen

- **Gesamtzeit:** 24 Arbeitsstunden
- **Kalendertage:** 3
- **PageSpeed mobil:** 96/100
- **Seitenzahl:** 5
- **Technologie:** Next.js, Tailwind, Vercel
- **Preis:** 399 €
- **Meetings:** 2 (Briefing + Review)
- **Revisionen:** 1 (2 kleine Änderungen)

## Wie ist das möglich?

Keine Magie. Nur moderner Stack und effizienter Workflow:

1. **Next.js + Tailwind** — wir schreiben kein CSS von Null, keine WordPress-Plugin-Konflikte
2. **Komponentenansatz** — bewährte Komponentenbibliothek
3. **Vercel Deploy** — kein FTP, keine Server, Deploy = Git Push
4. **Klares Briefing** — der Kunde wusste, was er will
5. **Keine unnötigen Features** — die Website tut genau das, was sie soll

## Was würde dasselbe bei einer "traditionellen" Agentur kosten?

Realistische Schätzung:
- **Zeit:** 4–8 Wochen
- **Meetings:** 5–10
- **Preis:** 1.600–3.200 €
- **PageSpeed:** 40–60/100 (WordPress + Template)

Es liegt nicht daran, dass diese Agenturen schlecht sind. Ihr Workflow basiert auf Technologien von 2015.

## Fazit

Eine Website in 3 Tagen zu bauen ist keine Ausnahme — es ist unser Standard. Wenn Sie eine Website brauchen und nicht wochenlang warten wollen — [melden Sie sich](/anfrage).

---

*Neugierig, was Ihre Website kosten würde? Der [Preisrechner](/leistungen) gibt Ihnen in 30 Sekunden eine Antwort.*`;

const INSERT_SQL = "INSERT INTO blog_posts (id, title, slug, content, excerpt, author_name, featured_image, published, published_at, tags, meta_title, meta_description, views, created_at, updated_at, language, scheduled_date, auto_translate, parent_post_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

async function main() {
  const csId = nanoid();
  const deId = nanoid();
  const now = Math.floor(Date.now() / 1000);

  // Download and create featured image
  const sharp = require('sharp');
  const https = require('https');
  const fs = require('fs');

  // Download stock image (office/workspace theme)
  await new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream('/tmp/blog-images/web3dny-raw.jpg');
    https.get('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop&q=80', (response: any) => {
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });

  // Create V2 image with overlay
  const svgOverlay = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="black" opacity="0.4"/>
      <rect y="570" width="1200" height="60" fill="#0d1117" opacity="0.85"/>
      <text x="30" y="608" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#14B8A6">W</text>
      <text x="48" y="608" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" fill="white">weblyx.cz</text>
      <rect y="568" width="1200" height="2" fill="#14B8A6"/>
    </svg>
  `;

  await sharp('/tmp/blog-images/web3dny-raw.jpg')
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toFile('/tmp/blog-images/web3dny-v2.jpg');

  // Upload to Vercel Blob
  const imgBuffer = fs.readFileSync('/tmp/blog-images/web3dny-v2.jpg');
  const blob = await put('blog/web-za-3-dny-v2.jpg', imgBuffer, {
    access: 'public',
    contentType: 'image/jpeg',
  });
  console.log("Image uploaded: " + blob.url);

  // Insert CS article
  await client.execute({
    sql: INSERT_SQL,
    args: [
      csId,
      "Postavili jsme web za 3 dny — takhle to vypadalo hodinu po hodině",
      "postavili-jsme-web-za-3-dny-hodinu-po-hodine",
      contentCS,
      "Klient napsal v pondělí, ve čtvrtek měl web. Custom Next.js, PageSpeed 96, cena 9 990 Kč. Kompletní timeline — hodinu po hodině.",
      "Weblyx tým",
      blob.url,
      1,
      now,
      JSON.stringify(["zákulisí agentury", "tvorba webu", "Next.js", "case study", "rychlý web", "webdesign"]),
      "Postavili jsme web za 3 dny — kompletní timeline | Weblyx",
      "Custom Next.js web za 3 dny: od briefu po launch. PageSpeed 96/100, cena 9 990 Kč. Podívejte se, jak to celé probíhalo hodinu po hodině.",
      0,
      now,
      now,
      "cs",
      null,
      1,
      null,
    ],
  });

  // Insert DE article
  await client.execute({
    sql: INSERT_SQL,
    args: [
      deId,
      "Wir haben eine Website in 3 Tagen gebaut — so sah es Stunde für Stunde aus",
      "website-in-3-tagen-gebaut-stunde-fuer-stunde",
      contentDE,
      "Der Kunde schrieb am Montag, am Donnerstag hatte er die Website. Custom Next.js, PageSpeed 96, Preis 399 €. Komplette Timeline.",
      "Seitelyx Team",
      blob.url,
      1,
      now,
      JSON.stringify(["Webentwicklung", "Case Study", "Next.js", "schnelle Website", "Webdesign"]),
      "Website in 3 Tagen gebaut — komplette Timeline | Seitelyx",
      "Custom Next.js Website in 3 Tagen: vom Briefing zum Launch. PageSpeed 96/100, ab 399 €. Sehen Sie den kompletten Ablauf.",
      0,
      now,
      now,
      "de",
      null,
      0,
      csId,
    ],
  });

  console.log("CS article inserted + published: " + csId);
  console.log("DE article inserted + published: " + deId);
  console.log("DONE - 6 articles on weblyx.cz/blog now!");
}

main().catch(console.error);
