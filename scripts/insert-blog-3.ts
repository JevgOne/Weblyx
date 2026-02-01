import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';

const db = createClient({
  url: 'libsql://weblyx-jevgone.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4OTY1NjksImlkIjoiNjQ0NDNiODktZTBmOC00NTUxLWFiNTItNDhkYTg4ZDIwMTcwIiwicmlkIjoiNTgyYjlkM2QtYjUxYS00NGE0LTgyZGYtMmEwY2I2OTM5N2NkIn0.U_aC0zZdrsTf3y3vz34C880xN_jVM3Mzo6qkKtmdZWqBb8Hsfho_O52rCVyTLZrHJQ2nxnuwWSZoxy7Am7poBw'
});

const id = nanoid();
const now = Math.floor(Date.now() / 1000);

const content = `
# Kolik REÁLNĚ vyděláme na webu za 8 000 Kč (ano, ukazujeme čísla)

*Série: Zákulisí agentury #3*

Vím, o čem teď přemýšlíš. "Weblyx dělá weby od 7 990 Kč — to je buď podvod, nebo dělají šunt." Chápu tě. Kdyby mi někdo řekl, že postaví funkční, rychlý web za cenu víkendového výletu, taky bych zvedl obočí.

Tak pojď. Dneska ti ukážu úplně všechno. Kolik hodin na webu za 8 000 Kč reálně strávíme, jaké nástroje používáme, kolik nás stojí a — hlavně — kolik si na tom **skutečně vyděláme**.

Žádné marketingové kecy. Jen čísla.

---

## ⏱️ Kolik hodin zabere web za 8 000 Kč

Pojďme si rozepsat typický projekt — třeba web pro malého živnostníka. Řekněme kadeřnictví, kavárna nebo fitness trenér. Jedna až pět stránek, kontaktní formulář, galerie, napojení na socky.

Tady je realita:

**1. Discovery call (úvodní hovor) — 30 minut**
Potřebujeme pochopit, co děláš, komu prodáváš a co od webu čekáš. Bez toho nemá smysl začínat. Někdy je to 15 minut, někdy 45 — v průměru půl hodiny.

**2. Design a návrh — 3–4 hodiny**
Nekreslíme v Photoshopu pixel po pixelu. Používáme vlastní komponentový systém v Next.js a Tailwind CSS. Ale i tak — vybrat správný layout, sladit barvy s tvou značkou, připravit responzivní návrh — to zabere. Minimum 3 hodiny, často 4.

**3. Vývoj — 8–12 hodin**
Tohle je jádro. Kódování v Next.js, napojení na Turso databázi, implementace kontaktních formulářů, SEO optimalizace, napojení analytiky. U jednodušších projektů 8 hodin, u složitějších klidně 12.

**4. Testování — 2 hodiny**
Mobil, tablet, desktop. Chrome, Safari, Firefox. Kontrola rychlosti, přístupnosti, formulářů. Lighthouse audit. Oprava bugů. Dvě hodiny minimum.

**5. Deployment (nasazení) — 1 hodina**
Nastavení domény, DNS záznamy, SSL certifikát, nasazení na Vercel, kontrola, že všechno běží. Hodina práce.

**6. Komunikace s klientem — 2 hodiny**
E-maily, zprávy, zpětná vazba, revize, vysvětlování. Tohle lidi často nepočítají, ale my ano. Reálně zabere kolem 2 hodin na projekt.

### Celkem: 16–20 hodin práce

V průměru to vychází na **18 hodin** na jeden web.

---

## 🛠️ Co nás stojí nástroje

Tady přichází ta "tajná ingredience" — a paradoxně je skoro zadarmo:

- **Vercel** (hosting) — free tier. Pro menší weby úplně stačí. Když klient přeroste, přejde na Pro za pár dolarů měsíčně.
- **Turso DB** (databáze) — free tier. Až 9 GB úložiště, miliardy řádků. Pro většinu webů víc než dost.
- **Doména** — ~300 Kč/rok. Tohle platí klient, ale počítejme to do nákladů projektu.
- **Next.js, Tailwind, React** — open source. Zdarma.
- **GitHub** — free tier. Zdarma.
- **Vývojové nástroje** (VS Code, Cursor, AI asistenti) — řekněme 500 Kč/měsíc rozpočítaných na projekt? Buďme velkorysí a řekněme **100 Kč na projekt**.

**Náklady na nástroje za jeden web: ~400 Kč** (započítáno doména + poměrná část nástrojů)

Zbytek jde do práce. Čistě lidské práce.

---

## 🧮 A teď ta nejdůležitější kalkulačka

Pojďme si to spočítat brutálně jednoduše:

> **8 000 Kč ÷ 18 hodin = 444 Kč/hodina**

Čtyři sta čtyřicet čtyři korun za hodinu.

Pro kontext: průměrný český freelance vývojář si účtuje **800–2 000 Kč/hodinu**. Seniorní vývojář klidně 1 500–3 000 Kč. Agentura? Tam se bavíme o sazbách 1 200–2 500 Kč/hodina.

My jsme na **444 Kč**.

Takže ano — na jednotlivém webu za 8 000 Kč si moc nevyděláme. A tady bych mohl článek ukončit s tím, že jsme blázni.

Ale...

---

## 💡 Proč to sakra děláme

Upřímná odpověď? Protože jeden web za 8 000 Kč není naším byznys modelem. Je to **vstupní brána**.

### 1. Objem
Jeden web = 444 Kč/hodina. Ale 10 webů měsíčně = stabilní příjem + vyladěný proces, který se s každým projektem zrychluje. Co dnes trvá 18 hodin, za půl roku trvá 14.

### 2. Měsíční správa a údržba
Většina klientů si k webu přidá měsíční správu — aktualizace, drobné úpravy, SEO monitoring. To je pravidelný, předvídatelný příjem, který ten první web dotuje.

### 3. Doporučení
Spokojený klient za 8 000 Kč řekne kamarádovi. Ten kamarád má firmu, která potřebuje web za 25 000 Kč. A jeho kolega chce e-shop za 50 000 Kč. **Jeden levný web generuje zakázky za násobky.**

### 4. Portfolio
Každý dokončený web je referenční projekt. A referenční projekty prodávají lépe než jakákoliv reklama.

### 5. Dokazujeme, že to jde
Věříme, že Next.js, Vercel a moderní stack dokážou dramaticky snížit náklady na kvalitní web. Každý projekt za 8 000 Kč je důkaz, že malý podnikatel nepotřebuje platit 50 tisíc za web, který bude pomalý a zastaralý.

---

## 🏢 Jak to dělá "klasická" agentura

Pro srovnání — takhle vypadá typický web u tradiční agentury:

1. **Klient zaplatí 40 000–80 000 Kč**
2. Agentura najme freelancera za **15 000–20 000 Kč**
3. Projektový manažer stráví pár hodin koordinací
4. Zbytek (20 000–55 000 Kč) jde na **režii, kanceláře, management a marži**

Výsledek? Klient zaplatí 3–5× víc. Freelancer, který web reálně staví, dostane zlomek. A agentura si nechá rozdíl.

Nechci říct, že je to špatný model — velké agentury řeší komplexní projekty, kde ta koordinace dává smysl. Ale pro web malého podnikatele? **Je to kanón na vrabce.**

My ten kanón nepotřebujeme. Stavíme rovnou. Bez prostředníků. Bez zbytečné režie.

---

## 🚫 Kdy řekneme "ne"

Transparentnost neznamená, že bereme všechno. Jsou projekty, kde upřímně řekneme: **"Tohle za 8 000 Kč nejde."**

Kdy říkáme ne:

- **E-shop s desítkami produktů** — to je jiná liga, jiný rozpočet
- **Komplexní webová aplikace** — uživatelské účty, platební brány, custom logika
- **"Chci to jako Airbnb, ale levně"** — ne. Prostě ne.
- **Klient nemá obsah a čeká, že ho napíšeme** — copywriting je samostatná disciplína
- **Nekonečné revize** — 2 kola revizí je v ceně, víc znamená víc práce (a víc peněz)

V takových případech buď nabídneme vyšší balíček, nebo klienta upřímně odkážeme jinam. Není ostuda říct "na tohle nejsme". Ostuda je slíbit něco, co nemůžeš dodat.

---

## 🎯 Proč ti to vlastně říkáme

Mohl bys se ptát: "Proč mi ukazujete svoji marži? To je přece konkurenční výhoda, ne?"

Jenže ono to funguje přesně naopak.

**Transparentnost JE ta konkurenční výhoda.**

Když ti řeknu, že si na tvém webu vydělám 444 Kč/hodinu, víš přesně, za co platíš. Žádné skryté poplatky. Žádný "discovery fee". Žádný "setup charge". Žádné překvapení na faktuře.

A to je v českém webovém světě — kde většina agentur tají ceny jako státní tajemství — dost neobvyklé.

My věříme, že důvěra se buduje čísly, ne sliby. A tenhle článek je toho důkazem.

---

## Co z toho plyne pro tebe

Pokud jsi malý podnikatel, živnostník nebo startup a potřebuješ web:

✅ Víš přesně, kolik hodin na tvém webu strávíme
✅ Víš, jaké nástroje používáme (a že nestojí majlant)
✅ Víš, kolik si vyděláme (a že to není zlodějina)
✅ Víš, kdy ti upřímně řekneme "tohle za 8 000 Kč nejde"

**Teď víš přesně, za co platíš.**

A jestli ti to dává smysl — [pošli nám poptávku](/poptavka). Žádné závazky, žádný nátlak. Jen upřímný rozhovor o tom, co potřebuješ a jestli ti s tím můžeme pomoct.

---

*P.S. — Jestli tě zajímá víc ze zákulisí, přečti si i [předchozí díly série](/blog). Píšeme o tom, jak fungujeme, proč děláme věci jinak a občas i o tom, co nám nevyšlo. Protože i to k transparentnosti patří.*
`;

const title = 'Kolik REÁLNĚ vyděláme na webu za 8 000 Kč (ano, ukazujeme čísla)';
const slug = 'kolik-realne-vydelame-na-webu-za-8-tisic';
const excerpt = 'Ukazujeme reálné náklady na web za 8 000 Kč — kolik hodin práce, jaké nástroje, jaká hodinová sazba a kolik si skutečně vyděláme. Radikální transparentnost od Weblyx.';
const tags = JSON.stringify(['cenotvorba', 'transparentnost', 'webová agentura', 'zákulisí', 'kolik stojí web', 'marže']);
const metaTitle = 'Kolik vyděláme na webu za 8 000 Kč — reálná čísla | Weblyx';
const metaDesc = 'Ukazujeme reálné náklady a marže na webu za 8 000 Kč. Kolik hodin, jaké nástroje, kolik si vyděláme. Radikální transparentnost od Weblyx.';

async function main() {
  const result = await db.execute({
    sql: `INSERT INTO blog_posts (id, title, slug, content, excerpt, author_name, published, published_at, tags, meta_title, meta_description, language, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 'cs', ?, ?)`,
    args: [id, title, slug, content, excerpt, 'Weblyx Team', now, tags, metaTitle, metaDesc, now, now]
  });
  console.log('✅ Inserted successfully!');
  console.log('ID:', id);
  console.log('Rows affected:', result.rowsAffected);

  // Verify
  const check = await db.execute({ sql: 'SELECT id, title, slug, published, published_at, language FROM blog_posts WHERE slug = ?', args: [slug] });
  console.log('Verification:', JSON.stringify(check.rows[0], null, 2));
}

main().catch(console.error);
