# 🔍 SEO Multi-Domain Setup

## ✅ Co jsem nastavil:

### **1. Dynamická SEO metadata podle domény**

Vytvořil jsem systém který **automaticky** změní SEO podle toho jestli jsi na:
- **weblyx.cz** → české SEO
- **seitelyx.de** → německé SEO

---

## 📄 Soubory které jsem vytvořil/upravil:

### **1. `/lib/seo-metadata.ts`** (NOVÝ)

Obsahuje:
- ✅ České SEO metadata
- ✅ Německé SEO metadata
- ✅ Funkci `getSEOMetadata()` která vrací správná metadata podle domény

**České SEO:**
```
Title: Tvorba webových stránek od 10 000 Kč | Web za týden | Weblyx
Description: Rychlá tvorba webů od 10 000 Kč...
Keywords: tvorba webových stránek, webové stránky cena, levné webové stránky...
```

**Německé SEO:**
```
Title: Webseitenerstellung ab 249€ | Website in einer Woche | Seitelyx
Description: Schnelle Webseitenerstellung ab 249€...
Keywords: Webseitenerstellung, Website erstellen, günstige Webseiten...
```

---

### **2. `/app/layout.tsx`** (UPRAVENO)

- ✅ Import `getSEOMetadata()`
- ✅ Dynamická metadata místo hardcoded českých

**Před:**
```typescript
export const metadata: Metadata = {
  title: "Tvorba webových stránek... | Weblyx", // hardcoded CZ
  ...
}
```

**Po:**
```typescript
export const metadata: Metadata = {
  ...getSEOMetadata(), // dynamicky CZ nebo DE
  ...
}
```

---

## 🌍 Co se změní podle domény:

| SEO Element | weblyx.cz (🇨🇿) | seitelyx.de (🇩🇪) |
|-------------|-----------------|-------------------|
| **Page Title** | Tvorba webových stránek od 10 000 Kč \| Weblyx | Webseitenerstellung ab 249€ \| Seitelyx |
| **Meta Description** | Rychlá tvorba webů od 10 000 Kč... | Schnelle Webseitenerstellung ab 249€... |
| **Keywords** | tvorba webových stránek, levné webové stránky... | Webseitenerstellung, günstige Webseiten... |
| **OG Title** | Tvorba webových stránek od 10 000 Kč | Webseitenerstellung ab 249€ |
| **OG Locale** | cs_CZ | de_DE |
| **Canonical URL** | https://weblyx.cz | https://seitelyx.de |
| **Alternate Language** | de (→ seitelyx.de) | cs (→ weblyx.cz) |
| **Site Name** | Weblyx | Seitelyx |

---

## 🔍 Google vyhledávání:

### **České výsledky (weblyx.cz):**
```
Tvorba webových stránek od 10 000 Kč | Web za týden | Weblyx
https://weblyx.cz
Rychlá tvorba webů od 10 000 Kč (AKCE 7 990 Kč). Web za týden,
načítání pod 2s, SEO zdarma. Nezávazná konzultace zdarma.
```

### **Německé výsledky (seitelyx.de):**
```
Webseitenerstellung ab 249€ | Website in einer Woche | Seitelyx
https://seitelyx.de
Schnelle Webseitenerstellung ab 249€ (ANGEBOT 199€). Website in
einer Woche, Ladezeit unter 2s, SEO inklusive.
```

---

## 🎯 Hreflang tagy (automaticky):

Google vidí že máš 2 jazykové verze:

```html
<!-- Na weblyx.cz: -->
<link rel="alternate" hreflang="de" href="https://seitelyx.de" />
<link rel="canonical" href="https://weblyx.cz" />

<!-- Na seitelyx.de: -->
<link rel="alternate" hreflang="cs" href="https://weblyx.cz" />
<link rel="canonical" href="https://seitelyx.de" />
```

**→ Google bude ukazovat správnou verzi podle jazyka uživatele!**

---

## 📊 Social Media (OG tags):

### **Facebook/LinkedIn sdílení:**

**weblyx.cz:**
- Title: Tvorba webových stránek od 10 000 Kč | Web za týden
- Description: Rychlá tvorba webů od 10 000 Kč...
- Site Name: Weblyx

**seitelyx.de:**
- Title: Webseitenerstellung ab 249€ | Website in einer Woche
- Description: Schnelle Webseitenerstellung ab 249€...
- Site Name: Seitelyx

---

## 🔧 Jak přidat SEO na další stránky:

### **Příklad: Blog post page**

```typescript
// app/blog/[slug]/page.tsx
import { getPageMetadata, getLocaleFromDomain } from '@/lib/seo-metadata';

export async function generateMetadata({ params }) {
  const locale = getLocaleFromDomain();
  const post = await getBlogPost(params.slug);

  return getPageMetadata(locale, {
    title: post.title,
    description: post.excerpt,
    path: `/blog/${params.slug}`,
  });
}
```

---

## ✅ Co funguje TEĎ:

Po **redeployu** weblyxde projektu bude mít:

- ✅ Německý title tag
- ✅ Německý meta description
- ✅ Německé keywords
- ✅ Německé Open Graph tagy
- ✅ Hreflang tag na weblyx.cz
- ✅ Canonical URL: seitelyx.de
- ✅ Locale: de_DE

---

## 🚀 Next steps:

### **1. Redeploy (NUTNÉ):**
```
Vercel → weblyxde → Deployments → Redeploy
```

### **2. Test SEO:**
```
# Po redeployu otevři:
https://weblyxde-xxx.vercel.app

# View page source (Ctrl+U nebo ⌘+U):
<title>Webseitenerstellung ab 249€ | Website in einer Woche | Seitelyx</title>
<meta name="description" content="Schnelle Webseitenerstellung ab 249€...">
<meta property="og:locale" content="de_DE">
```

### **3. Google Search Console:**
```
# Přidej OBA domény:
- https://search.google.com/search-console
- Add property: weblyx.cz
- Add property: seitelyx.de

# Ověř hreflang tagy v GSC Reports
```

---

## 🔍 SEO Keywords (DE):

Přidal jsem tyto německé klíčová slova:

```
- Webseitenerstellung
- Website erstellen
- Website Kosten
- Was kostet eine Website
- günstige Webseiten
- schnelle Webseitenerstellung
- Website in einer Woche
- Website ab 249€
- schnellste Websites
- Website unter 2 Sekunden
- Next.js Website
- Website für Selbstständige
- Online-Shop nach Maß
- SEO-Optimierung
- Webdesign
```

**→ Optimalizováno pro německý trh!**

---

## 📈 Tracking:

### **Google Analytics:**
Pokud máš GA4, můžeš sledovat:
- Traffic na weblyx.cz (český trh)
- Traffic na seitelyx.de (německý trh)
- Odděleně!

### **Google Search Console:**
```
seitelyx.de → Performance
→ Vidíš německá klíčová slova
→ Vidíš pozice v Německu
```

---

## ✅ Checklist:

Po redeployu zkontroluj:

- [ ] Title tag v němčině
- [ ] Meta description v němčině
- [ ] OG tags v němčině
- [ ] Hreflang tag přítomen
- [ ] Canonical URL = seitelyx.de
- [ ] Site name = Seitelyx

---

**Datum:** 2024-12-06
**Status:** ✅ Ready to deploy

**🤖 Generated with Claude Code**
