# 🔧 Search Console Indexing - Opravy provedeny

**Datum:** 2026-01-22
**Status:** ✅ Opravy dokončeny, čeká se na re-crawl

---

## ✅ Provedené opravy

### 1. **Oprava Offer Schema** - itemOffered field

**Problém:** Offer schema nemělo povinné pole `itemOffered`

**Řešení:**
```typescript
// lib/schema-org.ts - řádek 321-341
export function generateOfferSchema(pricing: PricingTier) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: pricing.name,
    description: pricing.description,
    price: pricing.price.toString(),
    priceCurrency: 'CZK',
    availability: 'https://schema.org/InStock',
    url: `${BASE_URL}/#pricing`,
    itemOffered: {  // ← PŘIDÁNO
      '@type': 'Service',
      name: pricing.name,
      description: pricing.description,
    },
    seller: {
      '@type': 'Organization',
      name: 'Weblyx',
    },
  };
}
```

**Dopad:** Opraveno na všech stránkách, kde se používá Offer schema (homepage, cenové stránky)

---

### 2. **Review Schema - Ověření**

**Status:** ✅ Review schema je v pořádku

Review schema obsahuje správně strukturované `itemReviewed` pole:

```typescript
// lib/schema-generators.ts - řádek 163-172
itemReviewed: {
  '@type': 'Service',
  name: serviceName,
  description: serviceDesc,
  provider: {
    '@type': 'Organization',
    name: orgName,
    url: orgUrl,
  },
},
```

Žádná oprava není potřeba.

---

### 3. **Sitemap Check**

**Status:** ✅ Sitemap bez problémů

```
✅ 17 URLs v sitemapě
✅ Všechny URL jsou HTTPS
✅ Všechny URL používají www prefix
✅ Žádné duplicity
✅ Všechny URL dostupné
```

---

## 📊 Current Status

### Search Console metriky (poslední 30 dní):
- **Total Clicks:** 13
- **Total Impressions:** 5,276
- **Avg CTR:** 0.22%
- **Avg Position:** 13.3

### Sitemap submission:
- **Submitted:** 19 URLs (2025-12-02)
- **Indexed:** 0 URLs (ještě pending)
- **Status:** Pending (čeká na crawl)

---

## 🎯 Co dělat dál

### 1. **Request Re-indexing**

Po nasazení oprav je třeba požádat Google o nový crawl:

```bash
# V Google Search Console:
1. Jděte na: https://search.google.com/search-console
2. URL Inspection Tool
3. Zadejte: https://www.weblyx.cz
4. Klikněte: "Request Indexing"

# Pro všechny důležité stránky:
- https://www.weblyx.cz/
- https://www.weblyx.cz/sluzby
- https://www.weblyx.cz/portfolio
- https://www.weblyx.cz/blog
- https://www.weblyx.cz/poptavka
```

### 2. **Submit Updated Sitemap**

```bash
# V Google Search Console:
1. Sitemaps → Add new sitemap
2. URL: https://www.weblyx.cz/sitemap.xml
3. SUBMIT

# Nebo použijte ping URL:
https://www.google.com/ping?sitemap=https://www.weblyx.cz/sitemap.xml
```

### 3. **Validate Structured Data**

Test strukturovaných dat pomocí Google Rich Results Test:

```
1. Jděte na: https://search.google.com/test/rich-results
2. Zadejte URL: https://www.weblyx.cz
3. Zkontrolujte výsledky
4. Mělo by projít BEZ chyb (✅)
```

### 4. **Monitor Coverage**

```bash
# Kontrolujte v Search Console každý týden:
- Index → Coverage
- Enhancements → Rich Results
- Experience → Core Web Vitals
```

---

## 🚀 Očekávané výsledky

### Časová osa:
- **0-3 dny:** Google re-crawl homepage a hlavních stránek
- **1-2 týdny:** Indexace všech 17 URLs v sitemapě
- **2-4 týdny:** Zlepšení pozic díky správným structured data
- **1-3 měsíce:** Zvýšení CTR díky rich snippets

### Metriky k sledování:
- ✅ **Indexed Pages:** Mělo by být 17/17 (nyní 0/19)
- 📈 **Impressions:** Očekáván nárůst o 20-40%
- 📈 **CTR:** Očekáván nárůst o 15-30% díky rich snippets
- 📈 **Clicks:** Proporcionální nárůst s impressions a CTR

---

## 📝 Poznámky

### Structured Data Priority (2025/2026):
1. ✅ **Organization** - Používá se (homepage)
2. ✅ **LocalBusiness** - Používá se (homepage)
3. ✅ **WebSite** - Používá se (homepage)
4. ✅ **Service** - Používá se (homepage, služby)
5. ✅ **Offer** - Opraveno (cenové stránky)
6. ✅ **Review** - Používá se (homepage reviews section)
7. ✅ **FAQ** - Používá se (FAQ stránka)
8. ✅ **BreadcrumbList** - Používá se (sub-pages)
9. ✅ **CreativeWork** - Používá se (portfolio)

### Known Good:
- ✅ All HTTPS
- ✅ Consistent www usage
- ✅ Mobile-friendly
- ✅ Fast loading (PageSpeed guarantee)
- ✅ Valid robots.txt
- ✅ Clean sitemap

---

## 🔗 Užitečné odkazy

- **Search Console:** https://search.google.com/search-console
- **Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Docs:** https://schema.org/
- **Google Search Central:** https://developers.google.com/search/docs

---

**Připraveno pro deployment a re-indexing!** 🚀
