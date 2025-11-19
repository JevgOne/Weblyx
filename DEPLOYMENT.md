# 🚀 Deployment na Vercel - Krok po kroku

## Metoda 1: Vercel Dashboard (DOPORUČENO - 2 minuty)

### Krok 1: Přejdi na Vercel
Otevři: https://vercel.com/new

### Krok 2: Import z GitHubu
1. Klikni na **"Import Git Repository"**
2. Najdi a vyber **`JevgOne/Weblyx`**
3. Pokud nevidíš repo, klikni "Adjust GitHub App Permissions" a povol přístup

### Krok 3: Configure Project
Vercel automaticky detekuje:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`

**Nic neměň**, defaultní nastavení je správné!

### Krok 4: Deploy
1. Klikni **"Deploy"**
2. Počkej ~2 minuty
3. **Hotovo!** 🎉

### Tvůj web bude dostupný na:
- `https://weblyx.vercel.app`
- Nebo vlastní doména (viz níže)

---

## Metoda 2: Vercel CLI (Pokročilé)

```bash
# 1. Login
npx vercel login

# 2. Deploy
npx vercel

# 3. Production deploy
npx vercel --prod
```

---

## 🌐 Vlastní doména (Optional)

### Krok 1: Přidej doménu ve Vercelu
1. Jdi na Dashboard → Settings → Domains
2. Přidej svou doménu (např. `weblyx.cz`)

### Krok 2: Nastav DNS
U svého poskytovatele domény (wedos.cz, forpsi.cz, etc.) přidej:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Krok 3: Počkej na propagaci
DNS propagace trvá 10 minut až 48 hodin (obvykle < 1 hodina)

---

## ✅ Automatický Deployment

Každý push na `main` branch automaticky vyvolá nový deployment!

```bash
git add .
git commit -m "Update website"
git push
# → Vercel automaticky nasadí změny za ~2 minuty
```

---

## 📊 Po nasazení zkontroluj:

- [ ] Web se načítá: `https://weblyx.vercel.app`
- [ ] Všechny stránky fungují
- [ ] Mobilní verze OK
- [ ] Header navigace funguje
- [ ] Formuláře se zobrazují
- [ ] 404 page funguje

---

## 🐛 Troubleshooting

### Build fails?
```bash
# Zkus build lokálně
npm run build

# Zkontroluj errors v Vercel logs
```

### 404 na subpages?
- Next.js App Router by měl fungovat automaticky
- Zkontroluj že máš správnou strukturu `/app/[page]/page.tsx`

### Slow performance?
- Next.js automaticky optimalizuje
- Zkontroluj Lighthouse score ve Vercelu (Analytics)

---

## 🎯 Production Checklist

- [x] Build úspěšný ✓
- [x] Git na GitHubu ✓
- [ ] Deploy na Vercel
- [ ] Vlastní doména (optional)
- [ ] Google Analytics (later)
- [ ] Contact form backend (later)
- [ ] Supabase setup (later)

---

**Kontakt pro podporu:**
- GitHub: https://github.com/JevgOne/Weblyx
- Vercel Dashboard: https://vercel.com/jevg-ones-projects

**Vytvořeno:** 19. 11. 2025
