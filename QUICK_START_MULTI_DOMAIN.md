# 🚀 Quick Start: Multi-Domain Setup

## TL;DR - Co bylo uděláno

✅ **Infrastruktura připravena** pro multi-domain setup:
- 🇨🇿 **weblyx.cz** → Čeština
- 🇩🇪 **seitelyx.de** → Němčina
- 🗄️ **Sdílená databáze** (Turso)
- 🔐 **Sdílený admin panel**

---

## ⚡ Rychlý deployment (5 minut)

### **1️⃣ Vercel - Český web (weblyx.cz)**

```bash
# 1. Vytvoř nový projekt na Vercel
# 2. Přidej environment variables:

NEXT_PUBLIC_DOMAIN=weblyx.cz
NEXT_PUBLIC_SITE_NAME=Weblyx
NEXT_PUBLIC_SITE_URL=https://weblyx.cz

# 3. Přidej všechny ostatní env vars z .env.example
# 4. Deploy
```

### **2️⃣ Vercel - Německý web (seitelyx.de)**

```bash
# 1. Vytvoř DALŠÍ projekt na Vercel (ze stejného repo)
# 2. Přidej environment variables:

NEXT_PUBLIC_DOMAIN=seitelyx.de
NEXT_PUBLIC_SITE_NAME=Seitelyx
NEXT_PUBLIC_SITE_URL=https://seitelyx.de

# 3. Přidej STEJNÉ DB credentials jako v prvním projektu
# 4. Deploy
```

### **3️⃣ Připoj domény**

```bash
# V Vercel dashboardu:
weblyx-cz → Domains → Add weblyx.cz
seitelyx-de → Domains → Add seitelyx.de
```

**✅ HOTOVO!** Oba weby běží se sdílenou DB a adminem.

---

## 🧪 Testování lokálně

### **Test 1: Czech version**
```bash
# .env.local
NEXT_PUBLIC_DOMAIN=weblyx.cz

npm run dev
# → http://localhost:3000 (bude v češtině)
```

### **Test 2: German version**
```bash
# .env.local
NEXT_PUBLIC_DOMAIN=seitelyx.de

npm run dev
# → http://localhost:3000 (bude v němčině)
```

---

## 📝 Přidání překladů

### **Krok 1: Najdi klíč v messages/cs.json**
```json
{
  "hero": {
    "title": "Tvorba webů, které opravdu prodávají"
  }
}
```

### **Krok 2: Přidej překlad do messages/de.json**
```json
{
  "hero": {
    "title": "Webseiten erstellen, die wirklich verkaufen"
  }
}
```

### **Krok 3: Použij v komponentě**
```typescript
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');
  return <h1>{t('title')}</h1>;
}
```

---

## 🔧 Co ještě zbývá udělat

### **Fáze 1: Migrace obsahu (doporučeno HNED)**

1. **Přesuň pages do `[locale]` struktury:**
   ```bash
   # Aktuálně:
   app/page.tsx
   app/o-nas/page.tsx

   # Doporučeno:
   app/[locale]/page.tsx
   app/[locale]/o-nas/page.tsx (Czech)
   app/[locale]/uber-uns/page.tsx (German)
   ```

2. **Uprav komponenty aby používaly translations:**
   ```typescript
   // Bylo:
   <h1>Tvorba webů</h1>

   // Bude:
   const t = useTranslations('hero');
   <h1>{t('title')}</h1>
   ```

3. **Přidej všechny texty do translation files:**
   - Procházej komponenty v `/components`
   - Vytáhni všechny hard-coded texty
   - Přidej je do `messages/cs.json` a `messages/de.json`

### **Fáze 2: Databáze s lokalizací (volitelné)**

Pokud chceš mít **rozdílný obsah** pro každý jazyk (např. jiné blog posty):

1. **Přidej `locale` field do DB tabulek:**
   ```sql
   ALTER TABLE blog_posts ADD COLUMN locale TEXT DEFAULT 'cs';
   CREATE INDEX idx_blog_posts_locale ON blog_posts(locale);
   ```

2. **Updatuj queries aby filtrovaly podle locale:**
   ```typescript
   const locale = useLocale();
   const posts = await turso.execute({
     sql: 'SELECT * FROM blog_posts WHERE locale = ?',
     args: [locale]
   });
   ```

---

## 🎯 Co už FUNGUJE

✅ **Domain detection:**
- weblyx.cz → automaticky zobrazí češtinu
- seitelyx.de → automaticky zobrazí němčinu

✅ **Middleware:**
- Bezpečnostní checks zachovány
- i18n logika přidána
- Admin panel funguje na obou doménách

✅ **Translations infrastructure:**
- `messages/cs.json` - české texty
- `messages/de.json` - německé texty
- `useTranslations()` hook ready to use

✅ **Shared resources:**
- 1 Turso databáze pro oba weby
- 1 Admin panel (přístupný na obou doménách)
- 1 codebase → snadná údržba

---

## 🐛 Troubleshooting

### **Problém: Web stále v češtině i na seitelyx.de**

**Řešení:**
```bash
# Zkontroluj environment variable:
echo $NEXT_PUBLIC_DOMAIN  # Musí být: seitelyx.de

# Redeployuj na Vercel s correct env var
```

### **Problém: Translations nefungují**

**Řešení:**
```bash
# 1. Zkontroluj že komponenta je "use client"
"use client";
import { useTranslations } from 'next-intl';

# 2. Zkontroluj že klíč existuje v JSON
console.log(t('hero.title')); // undefined? → přidej do messages/
```

### **Problém: Admin nefunguje na seitelyx.de**

**Řešení:**
Admin panel je **SKIP** i18n middleware → měl by fungovat stejně na obou doménách.
Zkontroluj že `/admin` route je excluded v middleware.ts (už je).

---

## 📚 Další dokumentace

- **Detailní setup:** `MULTI_DOMAIN_SETUP.md`
- **next-intl docs:** https://next-intl.dev
- **Vercel multi-tenant:** https://vercel.com/docs/multi-tenant

---

## ✅ Checklist před LIVE deploymentem

- [ ] Oba Vercel projekty vytvořeny
- [ ] Environment variables nastaveny
- [ ] Domény připojeny (weblyx.cz, seitelyx.de)
- [ ] Všechny texty přeloženy do němčiny
- [ ] Komponenty používají `useTranslations()`
- [ ] Admin panel funguje na obou doménách
- [ ] DB credentials jsou STEJNÉ v obou projektech
- [ ] Test na produkci (obě domény)

---

**🤖 Generated with Claude Code**
**Version:** 1.0
**Last updated:** 2024-12-06
