/**
 * Translate Czech blog articles to German and insert into Turso DB.
 * Run: cd /Users/zen/weblyx && npx tsx scripts/translate-blog-articles.ts
 */

import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ─────────────────────────────────────────────────────────────────────────────
// German translations — manually crafted, not machine-translated
// ─────────────────────────────────────────────────────────────────────────────

interface GermanArticle {
  parentId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  authorName: string;
  publishedAt: number;
}

const germanArticles: GermanArticle[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Article 1: 5 things you can fix on your website in 30 minutes
  // Original: 4HOccVH3J3AxDpVFi4p9h
  // ═══════════════════════════════════════════════════════════════════════════
  {
    parentId: "4HOccVH3J3AxDpVFi4p9h",
    slug: "5-dinge-website-selbst-reparieren-30-minuten",
    featuredImage:
      "https://1ob30es9bxbog4ii.public.blob.vercel-storage.com/blog/5-veci-diy-v2.jpg",
    authorName: "Weblyx Team",
    publishedAt: 1769941842,
    title:
      "5 Dinge, die du an deiner Website in 30 Minuten selbst reparieren kannst (ohne Programmierer)",
    excerpt:
      "Praktische Anleitung für 5 schnelle Website-Reparaturen, die du in 30 Minuten selbst erledigen kannst. Bilder, Meta-Tags, Alt-Texte, kaputte Links und unnötige Skripte — Schritt für Schritt ohne Programmierer.",
    tags: [
      "DIY Website",
      "Website-Optimierung",
      "SEO-Tipps",
      "Website-Geschwindigkeit",
      "Meta-Tags",
      "Anleitung",
    ],
    metaTitle:
      "5 Dinge, die du an deiner Website in 30 Minuten selbst reparieren kannst | Seitelyx",
    metaDescription:
      "Praktische Anleitung: 5 schnelle Website-Reparaturen ohne Programmierer. Bilder, Meta-Tags, Geschwindigkeit, SEO — alles in 30 Minuten. Schritt für Schritt.",
    content: `# 5 Dinge, die du an deiner Website in 30 Minuten selbst reparieren kannst (ohne Programmierer)

Du hast eine Website, aber irgendwas stimmt nicht? Die Seiten laden langsam, bei Google siehst du schlecht aus und insgesamt hast du das Gefühl, dass etwas Pflege nötig wäre? Gute Nachricht — es gibt jede Menge Dinge, die du selbst reparieren kannst, ohne eine einzige Zeile Code, und das dauert maximal 30 Minuten.

Dieser Artikel ist für dich, wenn du eine Website auf WordPress, Wix, Squarespace oder irgendeiner anderen Plattform hast und sie mit eigenen Händen ein bisschen verbessern willst. Wir gehen 5 konkrete Reparaturen durch, Schritt für Schritt.

## 1. Bilder optimieren — der größte Geschwindigkeitsfresser

### Was ist das Problem?

Bilder sind fast immer der Hauptgrund, warum eine Website langsam lädt. Eine typische Website hat Bilder mit 2–5 MB, obwohl 100–200 KB locker reichen würden. Du lädst ein Foto direkt vom Handy oder von einer Bilddatenbank hoch und denkst gar nicht daran, dass es eine Auflösung von 4000×3000 Pixeln hat — obwohl es auf der Website in einem Fenster von 800×600 angezeigt wird.

### Warum ist das wichtig?

- Langsames Laden = Besucher gehen (53 % der Nutzer verlassen eine Seite, wenn sie länger als 3 Sekunden lädt)
- Google bewertet die Website-Geschwindigkeit als Ranking-Faktor
- Unnötig große Bilder verbrauchen das Datenvolumen der mobilen Besucher

### Wie du es reparierst — Schritt für Schritt:

1. **Öffne [squoosh.app](https://squoosh.app)** (kostenlos, von Google) oder [tinypng.com](https://tinypng.com)
2. **Lade das Bild hoch** — du siehst einen Vergleich: Original vs. komprimiert
3. **Wähle das WebP-Format** — es ist 30–50 % kleiner als JPEG bei gleicher Qualität
4. **Stelle die Auflösung ein** je nachdem, wo das Bild angezeigt wird. Für ein Banner reichen 1600px Breite, für eine Artikel-Vorschau 800px
5. **Stelle die Qualität auf 75–80 %** — mit dem bloßen Auge erkennst du keinen Unterschied
6. **Lade es herunter und lade es wieder hoch** auf die Website anstelle des Originalbildes

**Bei WordPress:** Installiere das Plugin [ShortPixel](https://shortpixel.com) oder [Imagify](https://imagify.io) — sie komprimieren Bilder automatisch beim Hochladen.

**Erwartete Verbesserung:** Die Seite kann sich um 2–5 Sekunden schneller laden. Der PageSpeed-Score kann locker um 20–30 Punkte steigen.

---

## 2. Meta-Titel und Beschreibungen reparieren — der erste Eindruck bei Google

### Was ist das Problem?

Meta Title und Meta Description sind das, was Leute in den Google-Suchergebnissen sehen. Wenn dort „Startseite" oder „Unnamed page" steht, klickt niemand drauf. Und wenn dort nichts steht, erfindet Google selbst etwas — und das ist meistens nicht schmeichelhaft.

### Warum ist das wichtig?

- Der Meta Title ist eines der stärksten On-Page SEO-Signale
- Eine gute Beschreibung erhöht die CTR (Click-Through-Rate) — mehr Leute klicken auf deinen Link
- Das ist buchstäblich dein „Schaufenster" in der Suche

### Wie du es reparierst — Schritt für Schritt:

1. **Gehe zur [Google Search Console](https://search.google.com/search-console)** — falls du sie noch nicht eingerichtet hast, mach es jetzt (kostenlos)
2. **Klicke auf Leistung** und schau dir an, für welche Suchanfragen deine Website angezeigt wird
3. **Bei WordPress:** Installiere [Yoast SEO](https://yoast.com) oder [Rank Math](https://rankmath.com) — bei jeder Seite siehst du dann Felder für Meta Title und Description
4. **Schreibe einen Meta Title** (max. 60 Zeichen): Er sollte das Keyword enthalten und attraktiv sein. Beispiel: Statt „Über uns" schreibe „Wer wir sind | Webdesign mit Ergebnis-Garantie"
5. **Schreibe eine Meta Description** (max. 155 Zeichen): Fasse zusammen, was man auf der Seite findet, und füge einen Call-to-Action hinzu. Beispiel: „Wir erstellen Websites, die Umsatz bringen. 90+ PageSpeed, modernes Design, SEO von Tag eins. Kostenlose Beratung."
6. **Gehe mindestens die 5 wichtigsten Seiten durch:** Startseite, Über uns, Leistungen, Kontakt, Blog

**Tipp:** Achte darauf, dass jede Seite einen einzigartigen Title und eine einzigartige Description hat. Duplikate mag Google nicht.

**Erwartete Verbesserung:** Die CTR kann um 20–50 % steigen. Mehr Klicks bei gleicher Anzahl an Impressionen = mehr Besucher kostenlos.

---

## 3. Alt-Texte zu allen Bildern hinzufügen

### Was ist das Problem?

Alt-Text (alternativer Text) ist die Beschreibung eines Bildes, die angezeigt wird, wenn das Bild nicht geladen werden kann, und die von Screenreadern für Sehbehinderte vorgelesen wird. Die meisten Websites haben leere Alt-Texte oder etwas wie „IMG_20240315_142356.jpg". Das ist gleich doppelt problematisch.

### Warum ist das wichtig?

- **Barrierefreiheit:** Sehbehinderte Nutzer verwenden Screenreader. Ohne Alt-Text wissen sie nicht, was auf dem Bild ist. Und Barrierefreiheit ist gesetzlich vorgeschrieben (EU-Richtlinie zur Barrierefreiheit von Websites)
- **SEO:** Google kann Bilder nicht „sehen" — es liest Alt-Texte. Sie sind wichtig für die Google-Bildersuche
- **Nutzererlebnis:** Wenn ein Bild nicht geladen wird (langsame Verbindung, blockierter Server), wird zumindest der Text angezeigt

### Wie du es reparierst — Schritt für Schritt:

1. **Gehe deine Bilder auf der Website durch** — bei WordPress gehe zu Medien, Bibliothek
2. **Fülle bei jedem Bild das Feld Alternativer Text aus**
3. **Schreibe beschreibend, aber kurz:** Was ist auf dem Bild? Nicht „Bild", sondern „Design-Team arbeitet in einem Büro am Entwurf einer Website"
4. **Baue Keywords natürlich ein** — nicht „Web Webdesign Design Design", sondern in einem natürlichen Satz
5. **Dekorative Bilder** (rein visuelle Elemente, Linien, Hintergründe) dürfen einen leeren Alt-Text haben — das ist in Ordnung

**Beispiele für gute Alt-Texte:**
- Schlecht: „foto1.jpg"
- Schlecht: „Bild"
- Schlecht: „Webdesign Webdesign Webdesign"
- Richtig: „Responsive Website dargestellt auf Smartphone, Tablet und Computer"
- Richtig: „Diagramm zeigt einen Traffic-Anstieg von 150 % nach dem Redesign"

**Erwartete Verbesserung:** Bessere Positionen in der Google-Bildersuche, höherer Barrierefreiheits-Score (Lighthouse), und du erfüllst die gesetzlichen Anforderungen.

---

## 4. Kaputte Links finden und reparieren

### Was ist das Problem?

Kaputte Links (Broken Links) sind Links, die auf Seiten verweisen, die nicht mehr existieren — es wird ein 404-Fehler angezeigt. Das kann ein Link zu einem alten Artikel sein, den du gelöscht hast, ein Link zu einer fremden Website, die nicht mehr funktioniert, oder eine vertippte URL.

### Warum ist das wichtig?

- **UX-Katastrophe:** Du klickst auf einen Link und bekommst einen Fehler. Sofort verlierst du Vertrauen
- **SEO-Problem:** Google crawlt deine Website und interpretiert kaputte Links als minderwertigen Inhalt
- **Verlorener Link-Juice:** Wenn auf den kaputten Link Backlinks von anderen Websites zeigen, verlierst du SEO-Wert

### Wie du es reparierst — Schritt für Schritt:

1. **Verwende den [Dead Link Checker](https://www.deadlinkchecker.com)** (kostenlos) — gib deine Domain ein und lass die ganze Website durchsuchen
2. **Alternative:** [Broken Link Checker](https://www.brokenlinkcheck.com) oder die Chrome-Erweiterung „Check My Links"
3. **Gehe die Ergebnisse durch** — du siehst eine Liste aller kaputten Links und der Seiten, auf denen sie sich befinden
4. **Repariere sie:**
   - Wenn die Seite unter einer anderen URL existiert — aktualisiere den Link auf die neue Adresse
   - Wenn die Seite nicht mehr existiert — entferne den Link oder ersetze ihn durch eine relevante Alternative
   - Wenn du eine eigene Seite verschoben hast — richte eine 301-Weiterleitung ein (bei WordPress das Plugin Redirection)
5. **Bei WordPress:** Das Plugin [Broken Link Checker](https://wordpress.org/plugins/broken-link-checker/) überwacht kaputte Links automatisch

**Tipp für Profis:** In der Google Search Console im Bereich Indexierung, Seiten siehst du, welche deiner URLs einen 404-Fehler zurückgeben. Richte dafür 301-Weiterleitungen auf die relevanteste Seite ein.

**Erwartete Verbesserung:** Besseres Crawling und bessere Indexierung, weniger Beschwerden von Nutzern, höhere Vertrauenswürdigkeit der Website.

---

## 5. Website beschleunigen durch Entfernen unnötiger Skripte

### Was ist das Problem?

Jedes Skript auf deiner Website kostet Zeit. Chat-Widget, Facebook Pixel, Google Tag Manager mit 15 Tags, Share-Buttons, eingebettete Karte, eingebettetes Video — alles muss heruntergeladen und ausgeführt werden. Und das meiste davon? Benutzt niemand.

### Warum ist das wichtig?

- Jedes externe Skript fügt 0,5–2 Sekunden zur Ladezeit hinzu
- JavaScript blockiert das Rendern der Seite — der Browser muss warten, bis die Skripte heruntergeladen und ausgeführt sind
- Je mehr Skripte, desto mehr Daten und höherer Batterieverbrauch auf dem Handy

### Wie du es reparierst — Schritt für Schritt:

1. **Öffne deine Website in Chrome** — Rechtsklick, Untersuchen, Tab Network
2. **Lade die Seite neu (F5)** und sortiere nach Größe. Du siehst, was alles heruntergeladen wird
3. **Gehe es durch und stell dir folgende Fragen:**
   - Das Chat-Widget — antwortet darüber überhaupt jemand? Wenn nicht, weg damit
   - Facebook Pixel — wertest du aktiv Facebook-Werbung aus? Wenn nicht, brauchst du es nicht
   - Social-Media-Share-Buttons — klickt da jemand drauf? (Hinweis: meistens nicht)
   - Eingebettetes YouTube-Video — lässt es sich durch ein Vorschaubild mit Link ersetzen?
   - Hast du 3 Analytics-Skripte? Eins reicht (Google Analytics oder Plausible)
4. **Bei WordPress:** Gehe zu Plugins und deaktiviere alles, was du nicht benutzt. Jedes Plugin bedeutet potenzielle zusätzliche Skripte
5. **Entferne eingebetteten Code:** Wenn du im Header der Website manuell eingefügte Skripte hast (über ein Plugin wie Insert Headers and Footers), gehe sie durch und lösche die unnötigen

**Alternative:** Wenn du Google Tag Manager nutzt, geh hinein und schau, wie viele Tags aktiv sind. Pausiere alles, was du nicht brauchst.

**Erwartete Verbesserung:** Die Seite kann sich um 1–3 Sekunden schneller laden. Weniger Skripte = weniger potenzielle Sicherheitslücken.

---

## Bonus: Woran du erkennst, dass es funktioniert hat

Bevor du irgendetwas änderst, mach einen Screenshot deines PageSpeed-Scores:

1. Gehe auf [pagespeed.web.dev](https://pagespeed.web.dev)
2. Gib die URL deiner Website ein
3. Notiere dir den Score (Performance, Accessibility, SEO)
4. Führe alle 5 Reparaturen durch
5. Warte ein paar Stunden und miss erneut

Du wirst den Unterschied sehen. Garantiert.

## Ehrlich gesagt? Das ist erst der Anfang

Diese 5 Reparaturen können deine Website dramatisch verbessern. Aber seien wir ehrlich — wenn deine Website auf einem überteuerten Hosting läuft, ein Template mit 50 Plugins nutzt und 8 Sekunden zum Laden braucht, werden komprimierte Bilder sie nicht retten.

Wenn du WordPress hast, sind das großartige erste Schritte. Aber wenn du eine **wirklich schnelle, moderne Website** willst, die ab Werk einen PageSpeed von 95+ hat, ohne Plugins und Kompromisse — genau das machen wir bei [Seitelyx](https://www.seitelyx.de).

Wir bauen maßgeschneiderte Websites, die vom ersten Tag an schnell sind. Keine Templates, kein aufgeblähtes WordPress. Sauberer Code, moderne Technologien, Ergebnisse.

**Du willst eine Website, an der du nichts reparieren musst?** [Schreib uns](https://www.seitelyx.de/anfrage)`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Article 2: How much we REALLY earn on a website for 8,000 CZK
  // Original: 8UXhKIwABwQVfOTXgQk7Z
  // Adapted for German market: 499 EUR instead of 8,000 CZK
  // ═══════════════════════════════════════════════════════════════════════════
  {
    parentId: "8UXhKIwABwQVfOTXgQk7Z",
    slug: "was-wir-wirklich-an-website-fuer-499-euro-verdienen",
    featuredImage:
      "https://1ob30es9bxbog4ii.public.blob.vercel-storage.com/blog/kolik-vydelame-v2.jpg",
    authorName: "Weblyx Team",
    publishedAt: 1769941842,
    title:
      "Was wir WIRKLICH an einer Website für 499 € verdienen (ja, wir zeigen die Zahlen)",
    excerpt:
      "Wir zeigen die realen Kosten einer Website für 499 € — wie viele Arbeitsstunden, welche Tools, welcher Stundensatz und was wir tatsächlich verdienen. Radikale Transparenz von Seitelyx.",
    tags: [
      "Preisgestaltung",
      "Transparenz",
      "Webagentur",
      "Hinter den Kulissen",
      "Was kostet eine Website",
      "Marge",
    ],
    metaTitle:
      "Was wir an einer Website für 499 € verdienen — echte Zahlen | Seitelyx",
    metaDescription:
      "Wir zeigen reale Kosten und Margen einer Website für 499 €. Wie viele Stunden, welche Tools, was wir verdienen. Radikale Transparenz von Seitelyx.",
    content: `# Was wir WIRKLICH an einer Website für 499 € verdienen (ja, wir zeigen die Zahlen)

*Serie: Hinter den Kulissen einer Agentur #3*

Ich weiß, was du gerade denkst. „Seitelyx baut Websites ab 499 € — das ist entweder Betrug oder Pfusch." Ich verstehe dich. Wenn mir jemand sagen würde, er baut eine funktionale, schnelle Website zum Preis eines Wochenendausflugs, würde ich auch die Augenbraue hochziehen.

Also los. Heute zeige ich dir alles. Wie viele Stunden wir an einer Website für 499 € tatsächlich arbeiten, welche Tools wir nutzen, was sie uns kosten und — vor allem — wie viel wir **tatsächlich verdienen**.

Keine Marketing-Phrasen. Nur Zahlen.

---

## ⏱️ Wie viele Stunden eine Website für 499 € braucht

Schauen wir uns ein typisches Projekt an — sagen wir eine Website für einen Selbstständigen. Ein Friseur, ein Café oder ein Fitnesstrainer. Ein bis fünf Seiten, Kontaktformular, Galerie, Anbindung an Social Media.

Hier ist die Realität:

**1. Discovery Call (Erstgespräch) — 30 Minuten**
Wir müssen verstehen, was du machst, an wen du verkaufst und was du von der Website erwartest. Ohne das macht es keinen Sinn anzufangen. Manchmal sind es 15 Minuten, manchmal 45 — im Schnitt eine halbe Stunde.

**2. Design und Entwurf — 3–4 Stunden**
Wir designen nicht in Photoshop Pixel für Pixel. Wir nutzen unser eigenes Komponenten-System in Next.js und Tailwind CSS. Aber trotzdem — das richtige Layout wählen, die Farben auf deine Marke abstimmen, ein responsives Design vorbereiten — das dauert. Minimum 3 Stunden, oft 4.

**3. Entwicklung — 8–12 Stunden**
Das ist der Kern. Programmierung in Next.js, Anbindung an die Turso-Datenbank, Implementierung von Kontaktformularen, SEO-Optimierung, Analytics-Anbindung. Bei einfacheren Projekten 8 Stunden, bei komplexeren locker 12.

**4. Testing — 2 Stunden**
Handy, Tablet, Desktop. Chrome, Safari, Firefox. Geschwindigkeits-Check, Barrierefreiheits-Check, Formulare testen. Lighthouse-Audit. Bugs fixen. Zwei Stunden minimum.

**5. Deployment (Live-Schaltung) — 1 Stunde**
Domain einrichten, DNS-Einträge, SSL-Zertifikat, Deployment auf Vercel, Überprüfung, ob alles läuft. Eine Stunde Arbeit.

**6. Kommunikation mit dem Kunden — 2 Stunden**
E-Mails, Nachrichten, Feedback, Revisionen, Erklärungen. Das rechnen viele nicht mit ein, aber wir schon. Realistisch braucht das etwa 2 Stunden pro Projekt.

### Gesamt: 16–20 Arbeitsstunden

Im Durchschnitt sind es **18 Stunden** pro Website.

---

## 🛠️ Was uns die Tools kosten

Hier kommt die „geheime Zutat" — und paradoxerweise ist sie fast kostenlos:

- **Vercel** (Hosting) — Free Tier. Für kleinere Websites völlig ausreichend. Wenn der Kunde wächst, Upgrade auf Pro für wenige Euro im Monat.
- **Turso DB** (Datenbank) — Free Tier. Bis zu 9 GB Speicher, Milliarden Zeilen. Für die meisten Websites mehr als genug.
- **Domain** — ~15 €/Jahr. Das zahlt der Kunde, aber rechnen wir es in die Projektkosten ein.
- **Next.js, Tailwind, React** — Open Source. Kostenlos.
- **GitHub** — Free Tier. Kostenlos.
- **Entwicklungstools** (VS Code, Cursor, KI-Assistenten) — sagen wir 20 €/Monat umgerechnet auf ein Projekt? Seien wir großzügig und sagen **5 € pro Projekt**.

**Tool-Kosten pro Website: ~20 €** (eingerechnet Domain + anteiliger Anteil der Tools)

Der Rest fließt in die Arbeit. Reine Menschenarbeit.

---

## 🧮 Und jetzt die wichtigste Rechnung

Rechnen wir es brutal einfach:

> **499 € ÷ 18 Stunden = 27,72 €/Stunde**

Siebenundzwanzig Euro zweiundsiebzig pro Stunde.

Zum Vergleich: Ein durchschnittlicher freiberuflicher Entwickler in Deutschland verlangt **75–150 €/Stunde**. Ein Senior-Entwickler locker 100–200 €. Eine Agentur? Da reden wir von Sätzen zwischen 90–180 €/Stunde.

Wir liegen bei **27,72 €**.

Also ja — an einer einzelnen Website für 499 € verdienen wir nicht viel. Und hier könnte ich den Artikel beenden mit der Aussage, dass wir verrückt sind.

Aber...

---

## 💡 Warum wir das verdammt nochmal machen

Die ehrliche Antwort? Weil eine einzelne Website für 499 € nicht unser Geschäftsmodell ist. Sie ist das **Eingangstor**.

### 1. Volumen
Eine Website = 27,72 €/Stunde. Aber 10 Websites pro Monat = stabiles Einkommen + ein ausgefeilter Prozess, der mit jedem Projekt schneller wird. Was heute 18 Stunden dauert, dauert in einem halben Jahr 14.

### 2. Monatliche Betreuung und Wartung
Die meisten Kunden buchen zur Website eine monatliche Betreuung dazu — Updates, kleine Anpassungen, SEO-Monitoring. Das ist ein regelmäßiges, planbares Einkommen, das die erste Website querfinanziert.

### 3. Empfehlungen
Ein zufriedener Kunde für 499 € erzählt es einem Freund. Dieser Freund hat eine Firma, die eine Website für 1.500 € braucht. Und dessen Kollege möchte einen Online-Shop für 3.000 €. **Eine günstige Website generiert Aufträge für ein Vielfaches.**

### 4. Portfolio
Jede fertiggestellte Website ist ein Referenzprojekt. Und Referenzprojekte verkaufen besser als jede Werbung.

### 5. Wir beweisen, dass es geht
Wir glauben, dass Next.js, Vercel und ein moderner Tech-Stack die Kosten für eine hochwertige Website drastisch senken können. Jedes Projekt für 499 € ist der Beweis, dass ein kleiner Unternehmer nicht 5.000 € für eine Website zahlen muss, die langsam und veraltet ist.

---

## 🏢 Wie eine „klassische" Agentur das macht

Zum Vergleich — so sieht eine typische Website bei einer traditionellen Agentur aus:

1. **Der Kunde zahlt 3.000–8.000 €**
2. Die Agentur beauftragt einen Freelancer für **800–1.500 €**
3. Ein Projektmanager verbringt ein paar Stunden mit Koordination
4. Der Rest (1.500–6.000 €) geht in **Overhead, Büro, Management und Marge**

Das Ergebnis? Der Kunde zahlt 3–5× mehr. Der Freelancer, der die Website tatsächlich baut, bekommt einen Bruchteil. Und die Agentur behält die Differenz.

Ich will nicht sagen, dass das ein schlechtes Modell ist — große Agenturen bearbeiten komplexe Projekte, bei denen diese Koordination Sinn macht. Aber für die Website eines kleinen Unternehmers? **Das ist mit Kanonen auf Spatzen schießen.**

Wir brauchen keine Kanonen. Wir bauen direkt. Ohne Mittelsmänner. Ohne unnötigen Overhead.

---

## 🚫 Wann wir „Nein" sagen

Transparenz heißt nicht, dass wir alles annehmen. Es gibt Projekte, bei denen wir ehrlich sagen: **„Das geht für 499 € nicht."**

Wann wir Nein sagen:

- **Online-Shop mit Dutzenden Produkten** — das ist eine andere Liga, ein anderes Budget
- **Komplexe Webanwendung** — Benutzerkonten, Zahlungsgateways, Custom-Logik
- **„Ich will so etwas wie Airbnb, aber günstig"** — Nein. Einfach nein.
- **Der Kunde hat keinen Content und erwartet, dass wir ihn schreiben** — Copywriting ist eine eigenständige Disziplin
- **Endlose Revisionen** — 2 Revisionsrunden sind im Preis inbegriffen, mehr bedeutet mehr Arbeit (und mehr Kosten)

In solchen Fällen bieten wir entweder ein höheres Paket an oder verweisen den Kunden ehrlich woanders hin. Es ist keine Schande zu sagen „dafür sind wir nicht die Richtigen". Schande ist, etwas zu versprechen, was man nicht liefern kann.

---

## 🎯 Warum wir dir das eigentlich erzählen

Du könntest fragen: „Warum zeigt ihr mir eure Marge? Das ist doch ein Wettbewerbsvorteil, oder?"

Aber es funktioniert genau umgekehrt.

**Transparenz IST der Wettbewerbsvorteil.**

Wenn ich dir sage, dass wir an deiner Website 27,72 €/Stunde verdienen, weißt du genau, wofür du zahlst. Keine versteckten Gebühren. Keine „Discovery Fee". Keine „Setup-Gebühr". Keine Überraschungen auf der Rechnung.

Und das ist in der deutschen Web-Branche — wo die meisten Agenturen ihre Preise wie ein Staatsgeheimnis hüten — ziemlich ungewöhnlich.

Wir glauben, dass Vertrauen mit Zahlen aufgebaut wird, nicht mit Versprechen. Und dieser Artikel ist der Beweis dafür.

---

## Was das für dich bedeutet

Wenn du ein kleiner Unternehmer, Selbstständiger oder ein Startup bist und eine Website brauchst:

✅ Du weißt genau, wie viele Stunden wir an deiner Website arbeiten
✅ Du weißt, welche Tools wir verwenden (und dass sie kein Vermögen kosten)
✅ Du weißt, was wir verdienen (und dass es kein Wucher ist)
✅ Du weißt, wann wir dir ehrlich sagen „das geht für 499 € nicht"

**Jetzt weißt du genau, wofür du zahlst.**

Und wenn das für dich Sinn macht — [schick uns eine Anfrage](/anfrage). Keine Verpflichtungen, kein Druck. Nur ein ehrliches Gespräch darüber, was du brauchst und ob wir dir dabei helfen können.

---

*P.S. — Wenn dich mehr aus dem Agentur-Alltag interessiert, lies auch die [weiteren Teile der Serie](/blog). Wir schreiben darüber, wie wir arbeiten, warum wir Dinge anders machen und manchmal auch darüber, was nicht geklappt hat. Denn auch das gehört zur Transparenz.*`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Article 3: WordPress is dead and your agency won't tell you
  // Original: Ef9uBmET9E1T8gN7JQ1XP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    parentId: "Ef9uBmET9E1T8gN7JQ1XP",
    slug: "wordpress-vs-nextjs-vergleich-2026",
    featuredImage:
      "https://1ob30es9bxbog4ii.public.blob.vercel-storage.com/blog/wordpress-vs-nextjs-v2.jpg",
    authorName: "Weblyx Team",
    publishedAt: 1769941841,
    title: "WordPress ist tot und deine Agentur sagt es dir nicht",
    excerpt:
      "WordPress betreibt 40 % des Internets, aber ist es im Jahr 2026 noch die richtige Wahl für ein kleines Unternehmen? Ehrlicher Vergleich mit Next.js — Geschwindigkeit, Sicherheit, Kosten und Wartung. Ohne Bullshit.",
    tags: [
      "WordPress",
      "Next.js",
      "Vergleich",
      "Webentwicklung",
      "Website-Geschwindigkeit",
      "SEO",
    ],
    metaTitle:
      "WordPress vs Next.js — ehrlicher Vergleich für Unternehmer (2026)",
    metaDescription:
      "WordPress betreibt 40 % des Internets, aber ist es noch die richtige Wahl? Wir vergleichen Geschwindigkeit, Sicherheit, Kosten und Wartung. Ohne Bullshit.",
    content: `WordPress betreibt etwa 40 % aller Websites im Internet. Diese Zahlen kennst du — sie stehen in jedem zweiten Artikel über Webentwicklung. Aber weißt du, was dir diese Artikel nicht verraten? Dass die meisten dieser Websites langsam, löchrig und für ihre Besitzer teurer sind, als sie denken.

Ich bin Entwickler und habe jahrelang WordPress-Websites gebaut. Und dann habe ich damit aufgehört. Nicht, weil mir WordPress keinen Spaß mehr gemacht hat — sondern weil ich meinen Kunden nicht mehr mit gutem Gewissen sagen konnte, dass es die beste Wahl ist.

Im Jahr 2026 gibt es bessere Tools. Und deine Agentur sagt es dir entweder nicht — oder weiß es selbst nicht.

## Den Elefanten im Raum benennen: WordPress hat Probleme

Bevor ihr mich in den Kommentaren steinigt — ich versuche nicht zu sagen, dass WordPress nutzlos ist. Es war revolutionär. Es hat das Web demokratisiert. Nur hat sich die Welt weitergedreht und WordPress ist stehengeblieben.

### Geschwindigkeit? Eher Langsamkeit.

Die durchschnittliche WordPress-Website lädt **4 bis 8 Sekunden**. Und da rede ich von Websites, die „optimiert" sind. Ohne Optimierung? Locker 10+.

Google sagt: Wenn eine Seite nicht innerhalb von 3 Sekunden lädt, **verlassen 53 % der mobilen Nutzer die Seite**. Deine schöne WordPress-Website mit Parallax-Effekten und zwanzig Plugins sieht also in Wirklichkeit nur die Hälfte der Leute, die darauf klicken.

Warum ist das so langsam? WordPress generiert jede Seite dynamisch. Jedes Mal, wenn jemand deine Website besucht, muss der Server:
1. Die Anfrage lesen
2. PHP starten
3. Die Datenbank abfragen
4. Die Seite zusammenbauen
5. Das Ergebnis senden

Und das passiert **bei jedem Seitenaufruf**. Ja, es gibt Caching. Aber das ist wie ein Pflaster auf ein gebrochenes Bein zu kleben.

### Sicherheit? Plugin-Roulette.

WordPress selbst ist relativ sicher. Das Problem sind die Plugins. Und Plugins brauchst du für alles — Kontaktformular, SEO, Sicherheit, Galerie, Geschwindigkeit, Backups…

Eine durchschnittliche WordPress-Website hat **20–30 Plugins**. Jedes davon ist eine potenzielle Hintertür in deine Website. Im Jahr 2024 wurden über WordPress-Plugins **über 1 Million Websites kompromittiert** (Quelle: Wordfence). 2025 hat sich daran nichts gebessert.

Aber ohne Plugins kann WordPress fast nichts. Es ist so eine Art Frankenstein-Website — sie funktioniert, aber sie ist aus Teilen zusammengesetzt, die eher durch Zufall als durch Design miteinander kommunizieren.

### Wartung — dein neuer Teilzeitjob

Du hast eine WordPress-Website? Herzlichen Glückwunsch, du hast gerade einen unbezahlten Zweitjob bekommen:

- **WordPress-Updates** — jeden Monat
- **Plugin-Updates** — jede Woche (und beten, dass nichts kaputtgeht)
- **Theme-Updates** — gelegentlich, und wenn du es updatest, werden deine Anpassungen überschrieben
- **Backups** — weil: siehe oben
- **Sicherheitsmonitoring** — weil: siehe oben oben

Und was passiert, wenn du ein Plugin updatest und deine Website kaputtgeht? Du rufst die Agentur an. Und die berechnet dir „Wartung".

### Versteckte Kosten — WordPress ist nicht kostenlos

„WordPress ist kostenlos!" — das ist der größte Mythos, der kursiert. Technisch ja. Praktisch nein.

Reale Kosten einer typischen WordPress-Website pro Jahr:

- **Hosting** — 60–300 €/Jahr (und das günstige ist langsam)
- **Premium-Theme** — 40–120 € (einmalig, aber Updates…)
- **Premium-Plugins** — 120–600 €/Jahr (SEO, Formulare, Page Builder, Sicherheit)
- **SSL-Zertifikat** — oft im Hosting inbegriffen, aber nicht immer
- **Wartung / Agentur** — 20–120 €/Monat
- **Problemlösung** — unvorhersehbar, aber unvermeidlich

Unter dem Strich: **500 bis 2.000 € jährlich** für eine Website, die immer noch langsamer ist als sie sein sollte. Und das ohne die initiale Erstellung. Willst du wissen, was eine [moderne maßgeschneiderte Website](/leistungen) kostet? Überraschend weniger.

## Was ist Next.js — und warum sollte dich das interessieren

Jetzt denkst du: „Okay, WordPress ist ein Problem. Aber was stattdessen?"

Next.js. Und nein, du musst kein Programmierer sein, um zu verstehen, warum es besser ist.

### Erklärung für normale Menschen

Stell dir WordPress wie ein Restaurant vor. Jedes Mal, wenn du etwas bestellst, fängt der Koch von vorn an zu kochen. Du wartest. Und wartest.

Next.js ist wie ein Restaurant, wo das Essen **im Voraus zubereitet ist und auf dich wartet**. Du bestellst → du bekommst es. Sofort.

Technisch nennt man das **statische Generierung** (Static Site Generation). Deine Website wird „vorab gebaut" und als fertige HTML-Dateien ausgeliefert. Kein PHP. Keine Datenbank, in der bei jedem Aufruf herumgestochert wird. Keine Plugins.

### Was das in der Praxis bedeutet:

- **Geschwindigkeit unter 1 Sekunde** — Seiten laden sofort
- **Sicherheit by Default** — keine Plugins = keine Schwachstellen. Es gibt nichts zu hacken.
- **Keine Wartung** — keine Updates, keine Konflikte, kein „Website geht nicht"
- **Hosting kostenlos oder sehr günstig** — Plattformen wie Vercel bieten Hosting für solche Websites kostenlos an
- **Perfektes SEO** — Google liebt schnelle Websites. Und statische Websites sind die schnellsten.

### Aber… kann ich dort nicht selbst Texte ändern?

Doch. Es gibt sogenannte Headless-CMS-Systeme (Sanity, Strapi, Contentful und andere), die dir den gleichen Komfort wie das WordPress-Admin bieten — aber ohne die Nachteile. Du schreibst Text in einem übersichtlichen Editor, klickst auf Veröffentlichen, die Website aktualisiert sich automatisch.

Oder — und das ist unser Ansatz bei Seitelyx — wir richten die Content-Verwaltung genau nach deinen Bedürfnissen ein. Keine Dutzende Buttons, die du nicht brauchst. Nur das, was du tatsächlich nutzt. Schau dir an, wie die [Webentwicklung](/leistungen) bei uns in der Praxis funktioniert.

## Realer Vergleich: WordPress vs Next.js

Genug geredet, schauen wir uns die Zahlen an. So sieht der Vergleich in der Realität aus:

| Kriterium | WordPress | Next.js |
|---|---|---|
| **Ladegeschwindigkeit** | 4–8 Sekunden | Unter 1 Sekunde |
| **Sicherheit** | Abhängig von Plugins, häufige Schwachstellen | Hoch by Default, minimale Angriffsfläche |
| **Wartung** | Regelmäßig (Updates, Backups, Monitoring) | Minimal bis keine |
| **Jährliche Kosten** | 500–2.000 € | 0–200 € |
| **SEO-Performance** | Durchschnittlich (ohne teure Plugins) | Hervorragend (Geschwindigkeit + sauberer Code) |
| **Design-Flexibilität** | Durch Template begrenzt | Unbegrenzt |
| **Lernkurve für Verwaltung** | Niedrig (bekannte Umgebung) | Niedrig (mit Headless CMS) |
| **Skalierbarkeit** | Problematisch (mehr Inhalt = langsamer) | Hervorragend |
| **Entwickler nötig** | Für die Ersteinrichtung | Für die Ersteinrichtung |

Ja, du siehst richtig. Next.js gewinnt in fast allen Kategorien. Aber jetzt kommt der faire Teil…

## Wann WordPress SINN macht

Es wäre unfair zu sagen, dass WordPress für alles schlecht ist. Ist es nicht. Es gibt Szenarien, in denen es nach wie vor Sinn macht:

### 1. Riesige Publishing-Plattformen
Wenn du ein Nachrichtenportal mit Tausenden Artikeln täglich und Dutzenden Redakteuren betreibst — WordPress (oder eher WordPress VIP) ist immer noch eine starke Wahl. Aber… du bist kein Nachrichtenportal, oder?

### 2. Online-Shops auf WooCommerce (mit Einschränkungen)
WooCommerce ist ein ausgereiftes Ökosystem. Wenn du einen Online-Shop mit Tausenden Produkten und spezifischen Anforderungen hast, kann eine Migration teuer sein. Aber für einen neuen Online-Shop? Schau dir Shopify an.

### 3. Wenn du eine bestehende Website hast und sie funktioniert
Wenn deine WordPress-Website läuft, schnell ist, sicher ist und du keine Änderung brauchst — ändere nichts. „Never change a running system." Aber wenn du über eine neue Website nachdenkst, lies weiter.

### 4. Wenn du extrem spezifische Plugins brauchst
Einige Nischen-Plugins haben im Next.js-Ökosystem kein Äquivalent. Aber ehrlich — für 95 % der Firmenwebsites ist das irrelevant.

## Für wen Next.js (und Seitelyx) gedacht ist

Und jetzt zum Kern der Sache. Wenn du dich in der folgenden Beschreibung wiedererkennst, ist Next.js wahrscheinlich die richtige Wahl:

### Selbstständige und Freelancer
Du brauchst eine Website, die professionell aussieht, schnell lädt und um die du dich nicht kümmern musst. Du willst keine Updates, Hacks und Hosting-Probleme. Du willst eine Website haben und dich auf dein Business konzentrieren.

### Kleine und mittlere Unternehmen
Firmenpräsentation, Leistungsportfolio, Kontaktformular, vielleicht ein Blog. Das sind 80 % von dem, was du brauchst. Und dafür ist Next.js *perfekt*. Schau dir [unsere Referenzen](/portfolio) an — die meisten laufen auf Next.js und laden in unter einer Sekunde.

### Landing Pages und Kampagnen
Du launchst ein Produkt? Du brauchst eine Conversion-Seite? Geschwindigkeit und Performance sind hier entscheidend. Jede zusätzliche Sekunde kostet dich Conversions. Next.js gibt dir die Geschwindigkeit, die WordPress nie erreichen wird.

### Jeder, den seine langsame Website nervt
Wenn du deine Website auf dem Handy öffnest und wartest… und wartest… und dann aufgibst und immer noch wartest — ist es Zeit für einen Wechsel.

## Was das für dich bedeutet

Schau, ich rede nicht aus einer akademischen Technologie-Vergleichs-Perspektive. Ich rede als jemand, der täglich sieht, wie kleine Unternehmer Tausende pro Monat für Websites zahlen, die ihnen aktiv schaden.

Langsame Website = weniger Kunden. Das ist keine Meinung, das ist Mathematik.

**Wenn deine Agentur dir sagt, WordPress sei der einzige Weg — weiß sie entweder nichts von den Alternativen oder verdient an WordPress mehr.** Beides ist ein Problem.

Eine moderne Website im Jahr 2026 sollte sein:
- ⚡ Schnell (unter 2 Sekunden, idealerweise unter 1)
- 🔒 Sicher (ohne Hunderte Plugins als potenzielle Sicherheitslücken)
- 💰 Sparsam (niedrige Betriebskosten)
- 🎯 Effektiv (konvertiert Besucher zu Kunden)
- 😌 Sorgenfrei (keine Wartung deinerseits)

Und genau das machen wir bei Seitelyx. Wir bauen Websites auf Next.js, die all diese Punkte erfüllen. Kein Upselling auf Wartung. Keine versteckten Plugin-Kosten. Einfach eine Website, die funktioniert.

## Zusammenfassung

WordPress hat das Internet verändert. Dafür gebührt ihm Respekt. Aber die Welt hat sich weitergedreht. Im Jahr 2026 gibt es Tools, die schneller, sicherer, günstiger und wartungsärmer sind.

Für die meisten kleinen Unternehmen und Selbstständigen ist WordPress unnötig komplex, teuer und langsam. Next.js bietet alles, was du brauchst — und nichts von dem, was du nicht brauchst.

**Lass deine Website für dich arbeiten, nicht umgekehrt.**

---

## Willst du wissen, wie deine neue Website aussehen würde?

Ohne Verpflichtungen, ohne Bullshit. Schreib uns einfach und wir sagen dir, was für dich Sinn macht — ob Next.js oder vielleicht doch WordPress. Es kommt auf deine Situation an, nicht darauf, was wir verkaufen.

📩 [Unverbindliche Anfrage senden](/anfrage) — wir melden uns innerhalb von 24 Stunden.

Oder schau dir zuerst an, [wie wir arbeiten und was wir anbieten](/leistungen), beziehungsweise die [Projekte, die wir geliefert haben](/portfolio). Und wenn dich irgendetwas interessiert, [schreib uns direkt](/kontakt).`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main insertion logic
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 Checking for existing German translations...");

  const existing = await client.execute(
    "SELECT id, slug, parent_post_id FROM blog_posts WHERE language = 'de'"
  );

  if (existing.rows.length > 0) {
    console.log(
      `⚠️  Found ${existing.rows.length} existing German article(s):`
    );
    for (const row of existing.rows) {
      console.log(`   - ${row.slug} (parent: ${row.parent_post_id})`);
    }
    console.log("❌ Aborting to avoid duplicates. Delete them first if you want to re-insert.");
    process.exit(1);
  }

  console.log("✅ No existing German articles. Proceeding with insertion...\n");

  const now = Math.floor(Date.now() / 1000);

  for (const article of germanArticles) {
    const id = nanoid();

    console.log(`📝 Inserting: "${article.title}"`);
    console.log(`   ID: ${id}`);
    console.log(`   Parent: ${article.parentId}`);
    console.log(`   Slug: ${article.slug}`);

    await client.execute({
      sql: `INSERT INTO blog_posts (
        id, title, slug, content, excerpt, author_id, author_name,
        featured_image, published, published_at, tags, meta_title,
        meta_description, views, created_at, updated_at,
        language, scheduled_date, auto_translate, parent_post_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        article.title,
        article.slug,
        article.content,
        article.excerpt,
        null, // author_id
        article.authorName,
        article.featuredImage,
        1, // published
        article.publishedAt,
        JSON.stringify(article.tags),
        article.metaTitle,
        article.metaDescription,
        0, // views
        now,
        now,
        "de", // language
        null, // scheduled_date
        0, // auto_translate
        article.parentId, // parent_post_id
      ],
    });

    console.log(`   ✅ Inserted successfully!\n`);
  }

  console.log("🎉 All 3 German articles inserted successfully!");

  // Verify
  console.log("\n📊 Verification:");
  const result = await client.execute(
    "SELECT id, title, slug, language, parent_post_id FROM blog_posts WHERE language = 'de' ORDER BY published_at DESC"
  );

  for (const row of result.rows) {
    console.log(`   ✅ [${row.language}] ${row.title}`);
    console.log(`      Slug: ${row.slug} | Parent: ${row.parent_post_id}`);
  }

  console.log(`\nTotal German articles: ${result.rows.length}`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
