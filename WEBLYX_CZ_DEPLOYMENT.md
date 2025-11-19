# 🌐 Nasazení na weblyx.cz - Kompletní průvodce

## Krok 1️⃣: Deploy na Vercel (5 minut)

### A) Jdi na Vercel Import
**Otevři tento link:**
```
https://vercel.com/new
```

### B) Import GitHub Repository
1. Přihlas se GitHub účtem
2. Najdi repo **"Weblyx"** nebo **"JevgOne/Weblyx"**
3. Klikni "Import"

### C) Deploy
1. **Project Name:** weblyx (nebo nech defaultní)
2. **Framework:** Next.js (automaticky detekováno)
3. Klikni **"Deploy"**
4. Počkej ~2 minuty

✅ **Výsledek:** Web běží na `https://weblyx.vercel.app`

---

## Krok 2️⃣: Připojení domény weblyx.cz (10 minut)

### A) Přidej doménu ve Vercelu

1. Jdi na **Vercel Dashboard** → tvůj projekt "weblyx"
2. Klikni na **"Settings"** (nahoře)
3. V levém menu klikni **"Domains"**
4. Přidej doménu: `weblyx.cz`
5. Přidej také: `www.weblyx.cz`

Vercel ti ukáže DNS záznamy, které musíš nastavit.

---

## Krok 3️⃣: Nastav DNS záznamy

### Kde nastavit DNS?
Jdi k poskytovateli, kde máš doménu **weblyx.cz** registrovanou:
- **Wedos.cz:** https://client.wedos.com/domains/
- **Active24:** https://www.active24.cz/
- **Forpsi:** https://admin.forpsi.com/
- **Nebo jiný poskytovatel**

### DNS záznamy k přidání:

#### Pro hlavní doménu (weblyx.cz):

**A Record:**
```
Type:  A
Name:  @ (nebo prázdné)
Value: 76.76.21.21
TTL:   3600 (nebo automaticky)
```

#### Pro www subdoménu (www.weblyx.cz):

**CNAME Record:**
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   3600 (nebo automaticky)
```

### 📝 Příklad nastavení pro různé poskytovatele:

#### WEDOS:
1. Přihlas se → Domény → weblyx.cz
2. DNS záznamy → Přidat záznam
3. Přidej A record s hodnotou `76.76.21.21`
4. Přidej CNAME record `www` s hodnotou `cname.vercel-dns.com`
5. Ulož změny

#### Active24:
1. Správa DNS → weblyx.cz
2. Nový A záznam: `@` → `76.76.21.21`
3. Nový CNAME: `www` → `cname.vercel-dns.com`
4. Ulož

#### Forpsi:
1. Hosting → DNS Manager
2. Přidat A záznam pro root (@)
3. Přidat CNAME pro www
4. Uložit

---

## Krok 4️⃣: Ověření a čekání (10 min - 48 hodin)

### Propagace DNS:
- **Rychlá:** 10-30 minut
- **Normální:** 1-2 hodiny
- **Maximální:** až 48 hodin

### Zkontroluj DNS propagaci:
```
https://dnschecker.org/#A/weblyx.cz
```

### Ověř, že Vercel vidí doménu:
1. Vercel Dashboard → Settings → Domains
2. Měl by se objevit **zelený checkmark** ✓ u `weblyx.cz`

---

## Krok 5️⃣: SSL Certifikát (Automaticky)

Vercel automaticky vytvoří **Let's Encrypt SSL certifikát** pro:
- ✅ `https://weblyx.cz`
- ✅ `https://www.weblyx.cz`

To trvá 2-5 minut po úspěšné DNS propagaci.

---

## ✅ Výsledek:

Po dokončení tvůj web bude dostupný na:
- ✅ `https://weblyx.cz`
- ✅ `https://www.weblyx.cz`
- ✅ `https://weblyx.vercel.app` (backup)

---

## 🔄 Automatický deployment

Každý `git push` na `main` branch:
1. GitHub webhook aktivuje Vercel
2. Vercel automaticky buildne projekt
3. Deploy na produkci za ~2 minuty
4. Web je aktualizovaný na **weblyx.cz**

---

## 🐛 Troubleshooting

### Doména nefunguje po 2 hodinách?
1. Zkontroluj DNS záznamy v admin panelu poskytovatele
2. Ověř na https://dnschecker.org
3. Zkontroluj, že Vercel ukazuje "Valid Configuration"

### SSL certifikát nefunguje?
- Počkej 5 minut po DNS propagaci
- Vercel ho vytvoří automaticky
- Zkontroluj v Settings → Domains

### "Domain is already in use"?
- Nejdřív odstraň doménu z jiného Vercel projektu
- Nebo kontaktuj Vercel support

---

## 📞 Kde máš doménu weblyx.cz?

Pokud ještě **nemáš** doménu weblyx.cz zaregistrovanou:

### Registrace nové domény:

**Doporučení (české poskytovatele):**
1. **WEDOS** - https://www.wedos.cz (90 Kč/rok)
2. **Active24** - https://www.active24.cz (199 Kč/rok)
3. **Forpsi** - https://www.forpsi.cz (199 Kč/rok)

**Postup:**
1. Najdi weblyx.cz (zkontroluj, že je volná)
2. Zaregistruj doménu
3. V DNS nastavení nastav záznamy z Kroku 3
4. Pokračuj v průvodci

---

## 🎯 Quick Checklist:

- [ ] Vercel deployment úspěšný
- [ ] weblyx.cz přidána v Vercel → Domains
- [ ] DNS A record nastaven (76.76.21.21)
- [ ] DNS CNAME record nastaven (www → cname.vercel-dns.com)
- [ ] DNS propagace dokončena (10 min - 2 hod)
- [ ] SSL certifikát aktivní (automaticky)
- [ ] Web dostupný na https://weblyx.cz ✓

---

**Potřebuješ pomoc s konkrétním krokem?**
Napiš mi kde jsi zaseknutý! 😊

---

**Vytvořeno:** 19. listopadu 2025
**Status:** Připraveno k nasazení
