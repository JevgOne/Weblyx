/**
 * Insert article #6: "90 % webových agentur v ČR prodává předražený šablony"
 * Run: cd /Users/zen/weblyx && npx tsx scripts/insert-article-6.ts
 */

import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const articleContent = `Zaplatili jste 40 000 Kč za "web na míru" a pak jste na internetu našli úplně stejný design za 49 dolarů? Nejste sami.

Český trh s webovkami je plný firem, které kupují hotové šablony, změní barvy a logo, a pak to prodají jako originální práci. Za cenu, která by vám zaplatila skutečný custom vývoj. 

A nejhorší? Většina klientů to nikdy nezjistí.

## Jak to funguje (krok za krokem)

Typický workflow "agentury", která prodává šablony:

1. **Klient pošle poptávku.** "Chci moderní web pro svoji firmu."
2. **Agentura otevře ThemeForest.** Vybere šablonu za 39–79 $. WordPress, samozřejmě.
3. **Změní barvy a logo.** Přidá texty od klienta (nebo je nechá vymyslet ChatGPT).
4. **Nahraje na hosting.** Shared hosting za 50 Kč/měsíc.
5. **Fakturuje 30 000–80 000 Kč.** Za "webdesign na míru."

Celková práce? 4–8 hodin. Reálná hodnota? Možná 5 000 Kč.

A to nemluvíme o tom, že ten samý design používá dalších 200 firem po celém světě.

## 7 znaků, že máte předraženou šablonu

### 1. Web běží na WordPressu s názvem šablony v kódu

Klikněte pravým tlačítkem → "Zobrazit zdrojový kód" → hledejte \`/wp-content/themes/NÁZEV-ŠABLONY/\`. Pokud tam najdete něco jako \`flavor\`, \`flavor-starter\`, \`flavor-developer\`, je to šablona.

Ještě jednodušší: otevřete [WhatTheme.com](https://whattheme.com) a zadejte URL vašeho webu. Za 2 sekundy víte.

### 2. Stejný design má 50 dalších webů

Zkopírujte jakýkoli unikátní text z vašeho webu do Google. Nic? Zkuste screenshotovat design a reverse-searchnout na Google Images. Nebo prostě zadejte název šablony z bodu 1 do Google — uvidíte demo i další weby.

### 3. PageSpeed pod 50

Šablony jsou nafouklé. Obsahují desítky pluginů, fontů, animací a funkcí, které nikdy nepoužijete — ale váš web je musí načíst. Výsledek?

- **Průměrný WordPress šablonový web v ČR: PageSpeed 35–45**
- **Custom web (Next.js): PageSpeed 90+**

Otestujte si to: [pagespeed.web.dev](https://pagespeed.web.dev)

### 4. Nemůžete změnit nic bez agentury

"To by vyžadovalo úpravu šablony, takže 2 000 Kč." Slyšíte to pokaždé, když chcete změnit nadpis? Šablony jsou rigidní. Jsou navržené tak, aby vypadaly dobře v demu — ne aby se daly jednoduše upravovat pro reálný byznys.

### 5. Web nemá žádné custom funkce

Kontaktní formulář = plugin. Galerie = plugin. SEO = plugin. FAQ = plugin. Všechno je plugin. Nic není napsané přímo pro vás. To samo o sobě nemusí být problém, ale pokud za to platíte cenu custom vývoje — je.

### 6. Responzivita je "tak nějak"

Na mobilu se web rozpadne, menu nefunguje pořádně, tlačítka jsou moc malá. Proč? Protože agentura šablonu netestovala na všech zařízeních. Proč by taky — za 4 hodiny práce...

### 7. Nedostali jste zdrojový kód

Pokud vám agentura nedala přístupy ke všemu (hosting, doména, FTP, admin), nejste vlastníkem svého webu. Jste nájemce. A agentura je váš landlord, který si účtuje za každou žárovku.

## Proč to agentury dělají?

Protože to funguje. Většina klientů neví, jak poznat šablonu od custom webu. A proč by měli? Nejsou to vývojáři.

Problém je v tom, že:

- **Klient dostane produkt za 5 000 Kč, ale zaplatí 40 000 Kč**
- **Web bude pomalý, těžko upravitelný a za 2 roky zastaralý**
- **Agentura nemá motivaci nic vylepšovat** — čím víc problémů, tím víc faktur za "údržbu"

Je to byznys model postavený na informační asymetrii. Agentura ví víc než klient — a toho využívá.

## Co dělat, než si objednáte web

### Ptejte se na konkrétní věci:

- **"Na jaké technologii web poběží?"** — Pokud řeknou "WordPress s prémiovou šablonou", víte dost.
- **"Můžu vidět zdrojový kód?"** — Legitimní agentura nemá co skrývat.
- **"Kolik webů jste na této šabloně udělali?"** — Pokud zblednou, máte odpověď.
- **"Jaký bude PageSpeed skóre?"** — Pokud negarantují aspoň 80+, fajn.
- **"Dostanu kompletní přístupy?"** — Hosting, doména, admin, repozitář. Vše.

### Red flags v nabídce:

- ❌ "Web na míru od 30 000 Kč" ale dodání za 3 dny
- ❌ V portfoliu vypadají všechny weby stejně (protože jsou ze stejné šablony)
- ❌ Nezmíní konkrétní technologie
- ❌ "Měsíční správa webu 2 000 Kč" bez specifikace co to zahrnuje
- ❌ Nemají veřejné repozitáře na GitHubu

## Jak to děláme my

Neříkáme, že jsme jediní poctiví. Ale děláme to jinak:

- **Stavíme na Next.js** — žádné šablony, žádné WordPress pluginy, custom kód od A do Z
- **Garantujeme PageSpeed 90+** — nebo vrátíme peníze ([podmínky garance](/pagespeed-garance))
- **Dodáváme zdrojový kód** — na GitHubu, máte k němu plný přístup
- **Ceny od 7 990 Kč** — a za to dostanete REÁLNĚ custom web, ne přebarvenou šablonu
- **Transparentní kalkulačka** — víte přesně, kolik zaplatíte a za co ([kalkulačka ceny](/sluzby))

Není to levné proto, že děláme šablony. Je to levné proto, že jsme efektivní. Používáme moderní technologie, automatizaci a AI — ne proto, abychom šidili kvalitu, ale proto, abychom ji dali za rozumnou cenu.

## Shrnutí

Většina webových agentur v Česku prodává šablony za cenu custom vývoje. To není konspirační teorie — to je byznys model.

Naučte se poznat rozdíl. Ptejte se na technologie, PageSpeed, zdrojový kód a přístupy. A pokud dostanete vyhýbavé odpovědi — běžte jinam.

Váš web je vaše online vizitka. Zaslouží si víc než přebarvenou šablonu za 49 dolarů.

---

*Chcete web, který je skutečně na míru? [Pošlete nám poptávku](/poptavka) — odpovíme do 24 hodin a ukážeme vám přesně, co za vaše peníze dostanete.*`;

const articleDE = `Sie haben 1.500 € für eine "maßgeschneiderte Website" bezahlt und dann im Internet genau dasselbe Design für 49 Dollar gefunden? Sie sind nicht allein.

Der Markt für Webentwicklung ist voll von Firmen, die fertige Templates kaufen, Farben und Logo ändern und das Ganze dann als Originalarbeit verkaufen. Zum Preis, der Ihnen eine echte Custom-Entwicklung finanzieren würde.

Und das Schlimmste? Die meisten Kunden erfahren es nie.

## So funktioniert es (Schritt für Schritt)

Typischer Workflow einer "Agentur", die Templates verkauft:

1. **Kunde sendet Anfrage.** "Ich möchte eine moderne Website für mein Unternehmen."
2. **Agentur öffnet ThemeForest.** Wählt ein Template für 39–79 $. WordPress, natürlich.
3. **Ändert Farben und Logo.** Fügt Texte vom Kunden hinzu (oder lässt sie von ChatGPT erstellen).
4. **Lädt auf Hosting hoch.** Shared Hosting für 3 €/Monat.
5. **Stellt 1.200–3.200 € in Rechnung.** Für "maßgeschneidertes Webdesign."

Gesamtarbeit? 4–8 Stunden. Realer Wert? Vielleicht 200 €.

Und wir sprechen nicht davon, dass dasselbe Design von 200 anderen Firmen weltweit genutzt wird.

## 7 Anzeichen, dass Sie ein überteuertes Template haben

### 1. Die Website läuft auf WordPress mit Template-Name im Code

Rechtsklick → "Seitenquelltext anzeigen" → suchen Sie nach \`/wp-content/themes/TEMPLATE-NAME/\`. Wenn Sie dort etwas wie \`flavor\`, \`flavor-starter\`, \`flavor-developer\` finden — es ist ein Template.

Noch einfacher: Öffnen Sie [WhatTheme.com](https://whattheme.com) und geben Sie Ihre URL ein. In 2 Sekunden wissen Sie es.

### 2. Dasselbe Design haben 50 andere Websites

Kopieren Sie einen einzigartigen Text von Ihrer Website in Google. Nichts? Versuchen Sie einen Screenshot des Designs auf Google Images rückwärts zu suchen. Oder geben Sie einfach den Template-Namen aus Punkt 1 in Google ein — Sie sehen die Demo und andere Websites.

### 3. PageSpeed unter 50

Templates sind aufgebläht. Sie enthalten Dutzende Plugins, Fonts, Animationen und Funktionen, die Sie nie nutzen — aber Ihre Website muss sie laden. Ergebnis?

- **Durchschnittliche WordPress-Template-Website: PageSpeed 35–45**
- **Custom Website (Next.js): PageSpeed 90+**

Testen Sie es: [pagespeed.web.dev](https://pagespeed.web.dev)

### 4. Sie können nichts ohne die Agentur ändern

"Das würde eine Template-Anpassung erfordern, also 200 €." Hören Sie das jedes Mal, wenn Sie eine Überschrift ändern wollen? Templates sind starr. Sie sind so konzipiert, dass sie in der Demo gut aussehen — nicht für reale Geschäftsanpassungen.

### 5. Die Website hat keine Custom-Funktionen

Kontaktformular = Plugin. Galerie = Plugin. SEO = Plugin. FAQ = Plugin. Alles ist Plugin. Nichts wurde speziell für Sie geschrieben. Das allein muss kein Problem sein, aber wenn Sie den Preis für Custom-Entwicklung zahlen — ist es eins.

### 6. Responsive ist "so ungefähr"

Auf dem Handy bricht die Website auseinander, das Menü funktioniert nicht richtig, die Buttons sind zu klein. Warum? Weil die Agentur das Template nicht auf allen Geräten getestet hat. Warum auch — bei 4 Stunden Arbeit...

### 7. Sie haben keinen Quellcode erhalten

Wenn die Agentur Ihnen nicht alle Zugänge gegeben hat (Hosting, Domain, FTP, Admin) — sind Sie nicht der Eigentümer Ihrer Website. Sie sind Mieter. Und die Agentur ist Ihr Vermieter, der für jede Glühbirne extra kassiert.

## Warum machen Agenturen das?

Weil es funktioniert. Die meisten Kunden wissen nicht, wie man ein Template von einer Custom-Website unterscheidet. Und warum sollten sie? Sie sind keine Entwickler.

Das Problem ist:

- **Der Kunde bekommt ein Produkt für 200 €, zahlt aber 1.500 €**
- **Die Website wird langsam, schwer anpassbar und in 2 Jahren veraltet sein**
- **Die Agentur hat keine Motivation zu verbessern** — je mehr Probleme, desto mehr Rechnungen für "Wartung"

Es ist ein Geschäftsmodell, das auf Informationsasymmetrie basiert. Die Agentur weiß mehr als der Kunde — und nutzt das aus.

## Was tun, bevor Sie eine Website bestellen

### Fragen Sie nach konkreten Dingen:

- **"Auf welcher Technologie wird die Website laufen?"** — Wenn sie "WordPress mit Premium-Template" sagen, wissen Sie genug.
- **"Kann ich den Quellcode sehen?"** — Eine seriöse Agentur hat nichts zu verbergen.
- **"Wie viele Websites haben Sie mit diesem Template gemacht?"** — Wenn sie blass werden, haben Sie Ihre Antwort.
- **"Was wird der PageSpeed-Score sein?"** — Wenn sie nicht mindestens 80+ garantieren, Vorsicht.
- **"Bekomme ich alle Zugänge?"** — Hosting, Domain, Admin, Repository. Alles.

### Red Flags im Angebot:

- ❌ "Maßgeschneiderte Website ab 1.200 €" aber Lieferung in 3 Tagen
- ❌ Im Portfolio sehen alle Websites gleich aus (weil sie vom selben Template stammen)
- ❌ Keine konkreten Technologien erwähnt
- ❌ "Monatliche Webpflege 80 €" ohne Angabe, was das beinhaltet
- ❌ Keine öffentlichen Repositories auf GitHub

## So machen wir es

Wir sagen nicht, dass wir die einzig Ehrlichen sind. Aber wir machen es anders:

- **Wir bauen auf Next.js** — keine Templates, keine WordPress-Plugins, Custom-Code von A bis Z
- **Wir garantieren PageSpeed 90+** — oder Geld zurück ([Garantiebedingungen](/pagespeed-garance))
- **Wir liefern den Quellcode** — auf GitHub, mit vollem Zugang
- **Preise ab 320 €** — und dafür bekommen Sie eine ECHTE Custom-Website, kein umgefärbtes Template
- **Transparenter Preisrechner** — Sie wissen genau, was Sie bezahlen und wofür ([Preisrechner](/leistungen))

Es ist nicht günstig, weil wir Templates verwenden. Es ist günstig, weil wir effizient sind. Wir nutzen moderne Technologien, Automatisierung und KI — nicht um Qualität zu beschneiden, sondern um sie zu einem fairen Preis anzubieten.

## Zusammenfassung

Die Mehrheit der Webagenturen verkauft Templates zum Preis von Custom-Entwicklung. Das ist keine Verschwörungstheorie — das ist ein Geschäftsmodell.

Lernen Sie den Unterschied zu erkennen. Fragen Sie nach Technologien, PageSpeed, Quellcode und Zugängen. Und wenn Sie ausweichende Antworten bekommen — gehen Sie woanders hin.

Ihre Website ist Ihre Online-Visitenkarte. Sie verdient mehr als ein umgefärbtes Template für 49 Dollar.

---

*Wollen Sie eine Website, die wirklich maßgeschneidert ist? [Senden Sie uns eine Anfrage](/anfrage) — wir antworten innerhalb von 24 Stunden und zeigen Ihnen genau, was Sie für Ihr Geld bekommen.*`;

const INSERT_SQL = "INSERT INTO blog_posts (id, title, slug, content, excerpt, author_name, featured_image, published, published_at, tags, meta_title, meta_description, views, created_at, updated_at, language, scheduled_date, auto_translate, parent_post_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

async function main() {
  const csId = nanoid();
  const deId = nanoid();
  const now = Math.floor(Date.now() / 1000);

  // Insert Czech article (unpublished — waiting for Žeňa's approval)
  await client.execute({
    sql: INSERT_SQL,
    args: [
      csId,
      "90 % webových agentur v ČR prodává předražený šablony — jak je poznat",
      "predrazene-sablony-webovych-agentur-jak-je-poznat",
      articleContent,
      "Zaplatili jste 40 000 Kč za 'web na míru' a pak jste na internetu našli úplně stejný design za 49 dolarů? 7 konkrétních znaků, jak poznat předraženou šablonu.",
      "Weblyx tým",
      "",
      0,
      now,
      JSON.stringify(["webové agentury", "šablony", "WordPress", "předražené weby", "jak poznat podvod", "tvorba webů"]),
      "90 % agentur prodává předražený šablony | Jak poznat podvod | Weblyx",
      "Jak poznat, že vaše 'webovka na míru' je ve skutečnosti šablona za 50 $? 7 konkrétních znaků předražených webů.",
      0,
      now,
      now,
      "cs",
      null,
      1,
      null,
    ],
  });

  // Insert German translation (unpublished)
  await client.execute({
    sql: INSERT_SQL,
    args: [
      deId,
      "90 % der Webagenturen verkaufen überteuerte Templates — so erkennen Sie es",
      "ueberteuerte-templates-webagenturen-erkennen",
      articleDE,
      "Sie haben 1.500 € für eine 'maßgeschneiderte Website' bezahlt und dann dasselbe Design für 49 Dollar gefunden? 7 konkrete Anzeichen für überteuerte Templates.",
      "Seitelyx Team",
      "",
      0,
      now,
      JSON.stringify(["Webagenturen", "Templates", "WordPress", "überteuerte Websites", "Webdesign", "Custom Website"]),
      "90 % der Agenturen verkaufen überteuerte Templates | So erkennen Sie es | Seitelyx",
      "Wie erkennen Sie, dass Ihre 'maßgeschneiderte Website' eigentlich ein Template für 49 $ ist? 7 konkrete Anzeichen.",
      0,
      now,
      now,
      "de",
      null,
      0,
      csId,
    ],
  });

  console.log("CS article inserted: " + csId);
  console.log("DE article inserted: " + deId + " (parent: " + csId + ")");
  console.log("Both articles are UNPUBLISHED - waiting for approval");
}

main().catch(console.error);
