# 🎭 Mock Firebase - Lokální vývoj bez Firebase

## ✅ Co je hotové

Weblyx nyní funguje s **mock Firebase službou** - to znamená, že můžeš vyvíjet **bez instalace Java**, **bez Firebase Emulátorů** a **bez skutečného Firebase projektu**.

## 🚀 Jak to funguje

### 1. Mock služba běží automaticky

Při `npm run dev` se automaticky používá mock Firebase služba, která:
- Ukládá data do paměti (nejsou perzistentní mezi restarty)
- Simuluje Firebase Auth, Firestore a Storage
- Funguje okamžitě bez konfigurace

### 2. Admin přihlášení

**URL:** http://localhost:3000/admin/login

**Demo účet:**
- **Email:** `admin@weblyx.cz`
- **Heslo:** `Admin123!`

### 3. Poptávkový formulář

**URL:** http://localhost:3000/poptavka

Formulář má 4 kroky:
1. **Typ projektu** - Výběr typu webu
2. **O firmě** - Název a popis
3. **Požadavky** - Rozpočet a časový rámec
4. **Kontakt** - Jméno, email, telefon

Po odeslání se data uloží do mock Firestore a zobrazí se na stránce `/admin/leads`.

### 4. Admin panel

Po přihlášení máš přístup k:
- **Dashboard** - Přehled statistik
- **Poptávky (Leads)** - Seznam všech poptávek (včetně těch z formuláře)
- **Projekty** - Správa projektů
- **Emails** - Email management
- **Kalendář** - Termíny a milníky

## 📁 Struktura souborů

```
/lib/mock-firebase.ts       # Mock Firebase služba (Auth, Firestore, Storage)
/lib/firebase.ts            # Wrapper, který vybírá mock nebo real Firebase
/app/admin/login/page.tsx   # Admin přihlášení
/app/admin/dashboard/       # Admin dashboard
/app/admin/leads/           # Správa poptávek
/app/poptavka/              # Poptávkový formulář
```

## 🎯 Testovací scénář

1. **Spusť dev server:**
   ```bash
   npm run dev
   ```

2. **Vyplň poptávkový formulář:**
   - Jdi na http://localhost:3000/poptavka
   - Vyplň všechny kroky
   - Odešli formulář

3. **Přihlaš se do admin panelu:**
   - Jdi na http://localhost:3000/admin/login
   - Email: `admin@weblyx.cz`
   - Heslo: `Admin123!`

4. **Zobraz poptávky:**
   - V dashboardu klikni na "Poptávky"
   - Měl bys vidět poptávku z formuláře
   - Plus 2 demo poptávky, které jsou předvyplněné

## 🔄 Přechod na skutečný Firebase

Když budeš chtít použít skutečný Firebase:

1. Vytvoř Firebase projekt na https://console.firebase.google.com
2. Zkopíruj Firebase config
3. Vytvoř `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=tvůj-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projekt.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tvůj-projekt
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projekt.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
   NEXT_PUBLIC_USE_REAL_FIREBASE=true  # ← Toto přepne na real Firebase
   ```

4. Povol Authentication (Email/Password) v Firebase Console
5. Vytvoř admin uživatele v Authentication
6. Vytvoř kolekci `admins` ve Firestore s dokumentem:
   ```json
   {
     "uid": "uid-z-authentication",
     "email": "admin@weblyx.cz",
     "role": "admin"
   }
   ```

## 🎭 Mock data

Mock služba obsahuje předvyplněná demo data:

### Admin účet:
- UID: `admin-mock-uid`
- Email: `admin@weblyx.cz`
- Heslo: `Admin123!`

### Demo poptávky (2x):
1. Test Company s.r.o. - E-shop pro outdoor
2. Stavební firma ABC - Prezentační web

### Demo projekt (1x):
- E-shop Outdoor (65% hotovo, priorita HIGH)

## 🐛 Debugging

Console log v prohlížeči ukazuje:
- 🎭 Označuje mock Firebase operace
- ✅ Úspěšné operace
- ❌ Chyby

## 📝 Co dál?

- [ ] Propojit projekty a poptávky (konverze lead → project)
- [ ] Email notifikace přes Resend
- [ ] File upload do Firebase Storage
- [ ] Real-time updates ve Firestore
- [ ] Export dat (CSV, Excel)
- [ ] Dashboard analytics
- [ ] Kalendář view

## 🔧 Technické detaily

### Mock Firebase API

Mock služba implementuje tyto Firebase metody:

**Auth:**
- `signInWithEmailAndPassword(email, password)`
- `signOut()`
- `onAuthStateChanged(callback)`

**Firestore:**
- `db.collection(name).add(data)`
- `db.collection(name).get()`
- `db.collection(name).doc(id).get()`
- `db.collection(name).doc(id).set(data)`
- `db.collection(name).doc(id).update(data)`
- `db.collection(name).doc(id).delete()`
- `db.collection(name).where(field, op, value).get()`

**Storage:**
- `storage.ref(path).put(file)`
- `storage.ref(path).getDownloadURL()`
- `storage.ref(path).delete()`

---

**🎉 Vše funguje lokálně bez závislosti na externích službách!**
