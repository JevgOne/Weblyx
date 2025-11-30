# 📱 PWA Mobile Admin - Kompletní Setup Guide

## 🎯 Overview

Kompletní **Progressive Web App** řešení pro Weblyx Admin s full funkcionalitou:

✅ **Instalovatelná na mobil** (Android i iOS)
✅ **Offline režim** - funguje bez internetu
✅ **Push notifikace** - okamžité upozornění na nové poptávky
✅ **Všechny admin funkce** - leads, projekty, blog, CMS, analytics
✅ **Rychlá jako native app** - Service Worker caching
✅ **Žádný App Store** - instalace jedním kliknutím

---

## 📦 Co je implementováno

### 1️⃣ PWA Core

- ✅ `/public/manifest.json` - PWA manifest s shortcuts a theme
- ✅ `/public/sw.js` - Service Worker pro offline mode
- ✅ `/app/offline/page.tsx` - Offline stránka
- ✅ PWA meta tagy v `app/layout.tsx`
- ✅ PWAProvider s auto-detection

### 2️⃣ Install Prompt

- ✅ `/components/pwa/PWAInstallPrompt.tsx` - Smart install banner
- ✅ Auto-zobrazení po 30s
- ✅ Don't show again for 7 days
- ✅ Integrováno do admin layoutu

### 3️⃣ Push Notifikace

- ✅ `/lib/push-notifications/fcm-client.ts` - FCM klient
- ✅ `/lib/push-notifications/send-notification.ts` - Send utility
- ✅ `/app/api/push/send/route.ts` - Server-side FCM API
- ✅ `/components/admin/NotificationPermission.tsx` - Permission UI
- ✅ Integrace do leads API - notifikace při nové poptávce

---

## 🔧 Setup Instrukce

### Krok 1: Firebase Cloud Messaging Setup

#### 1.1 Získej VAPID klíč

1. Jdi na [Firebase Console](https://console.firebase.google.com)
2. Vyber svůj projekt (nebo vytvoř nový)
3. **Project Settings** → **Cloud Messaging**
4. Sekce **Web Push certificates**
5. Klikni **Generate key pair**
6. Zkopíruj **VAPID key** (začíná `B...`)

#### 1.2 Získej Firebase Admin SDK credentials

1. V Firebase Console → **Project Settings** → **Service Accounts**
2. Klikni **Generate new private key**
3. Stáhne se JSON soubor
4. Z něj potřebuješ:
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

#### 1.3 Aktualizuj firebase-messaging-sw.js

Otevři `/public/firebase-messaging-sw.js` a nahrď placeholder hodnoty svými Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Krok 2: Environment Variables

Přidej do `.env.local`:

```bash
# PWA Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Firebase Admin SDK (for sending push notifications)
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

⚠️ **DŮLEŽITÉ:** Private key musí být v uvozovkách a s `\n` pro nové řádky!

### Krok 3: Vercel Deployment

```bash
# Nastav env variables na Vercelu
vercel env add NEXT_PUBLIC_FIREBASE_VAPID_KEY production
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

# Deploy
vercel --prod
```

### Krok 4: Test Lokálně

```bash
# Spusť dev server
npm run dev

# Otevři admin panel
open http://localhost:3000/admin/leads

# Měl bys vidět:
# 1. "Instalovat Weblyx Admin" banner (po 30s)
# 2. "Zapnout push notifikace" tlačítko v header
```

---

## 📱 Jak Instalovat PWA na Mobil

### Android (Chrome)

1. Otevři `https://weblyx.cz/admin` v Chrome
2. Klikni na banner "Instalovat Weblyx Admin"
3. NEBO: Menu (⋮) → **Add to Home screen**
4. Aplikace se přidá na hlavní obrazovku
5. Spusť jako normální aplikaci

### iOS (Safari)

1. Otevři `https://weblyx.cz/admin` v Safari
2. Klikni **Share** button (čtverec se šipkou nahoru)
3. **Add to Home Screen**
4. Pojmenuj "Weblyx Admin" → **Add**
5. Aplikace se přidá na hlavní obrazovku

### Desktop (Chrome/Edge)

1. Otevři `https://weblyx.cz/admin`
2. Ikona instalace v address baru (⊕)
3. NEBO banner "Instalovat Weblyx Admin"
4. Klikni **Install**
5. Aplikace se otevře v samostatném okně

---

## 🔔 Jak Zapnout Push Notifikace

### V Admin Panelu

1. Jdi na `/admin/leads`
2. V headeru vidíš **"Zapnout push notifikace"** tlačítko
3. Klikni na něj
4. Prohlížeč požádá o povolení → **Allow**
5. FCM token se uloží do Firestore
6. Done! Dostáváš notifikace při nové poptávce

### Testování Notifikací

Odešli testovací poptávku:

```bash
curl -X POST https://weblyx.cz/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123456789",
    "companyName": "Test Company",
    "projectType": "e-shop",
    "budget": "20-50k",
    "timeline": "1-2 měsíce",
    "businessDescription": "Test business",
    "features": ["Payment gateway"]
  }'
```

**Očekávaný výsledek:**
1. ✅ Push notifikace na mobilu: "🔔 Nová poptávka!"
2. ✅ Kliknutím se otevře `/admin/leads`
3. ✅ Vidíš nový lead v tabulce

---

## 🧪 Testování

### Test PWA Install

1. Otevři Chrome DevTools → **Application** tab
2. **Manifest** → zkontroluj že je vše OK (zelené checkmarks)
3. **Service Workers** → měl by běžet `sw.js`
4. Klikni **Update on reload** pro dev testing

### Test Offline Mode

1. V DevTools → **Network** tab
2. Vyber **Offline**
3. Refreshni stránku
4. Měla by se načíst z cache (nebo zobrazit `/offline`)

### Test Push Notifications

1. DevTools → **Application** → **Service Workers**
2. V sekci **Push** klikni **Send push message**
3. Měl by se zobrazit systémový notification

### Test Performance

PWA by měla načítat:
- **First load:** ~1.5s
- **Cached load:** ~0.3s
- **Offline load:** ~0.1s

---

## 📊 Firebase Firestore Structure

### Collection: `fcmTokens`

```javascript
{
  "userId": "admin-abc123",
  "token": "fxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "updatedAt": "2025-01-30T12:00:00Z",
  "platform": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)..."
}
```

---

## 🎨 Customizace

### Změna PWA barvy

`/public/manifest.json`:
```json
{
  "theme_color": "#14B8A6",  // ← Změň na svou barvu
  "background_color": "#ffffff"
}
```

`app/layout.tsx`:
```tsx
<meta name="theme-color" content="#14B8A6" />  // ← Změň zde
```

### Změna PWA ikon

1. Vygeneruj ikony na [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Nahraj do `/public/`
3. Update `manifest.json` s novými cestami

### Přidání shortcuts

`/public/manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "Nový shortcut",
      "url": "/admin/custom-page",
      "icons": [...]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### ❌ PWA se nezobrazuje v Chrome

**Příčina:** Manifest nebo Service Worker chyba

**Řešení:**
1. DevTools → **Console** → zkontroluj chyby
2. **Application** → **Manifest** → zkontroluj validaci
3. **Application** → **Service Workers** → zkontroluj že běží

---

### ❌ Install prompt se nezobrazuje

**Možné příčiny:**
- PWA už je nainstalovaná
- Prompt byl dismissed v posledních 7 dnech
- Site není přes HTTPS (produkce)
- Manifest nebo SW chybí

**Řešení:**
```javascript
// Clear localStorage (dismiss history)
localStorage.removeItem('pwa-install-dismissed');

// Reload stránku
location.reload();
```

---

### ❌ Push notifikace nefungují

**Krok 1:** Zkontroluj FCM setup

```bash
# Zkontroluj že env variables jsou nastavené
cat .env.local | grep -E "VAPID|FIREBASE_ADMIN"
```

**Krok 2:** Zkontroluj Firebase Messaging SW

1. DevTools → **Application** → **Service Workers**
2. Měl by běžet `firebase-messaging-sw.js`
3. Zkontroluj Console na chyby

**Krok 3:** Zkontroluj Firestore

1. Firebase Console → **Firestore Database**
2. Kolekce `fcmTokens` by měla obsahovat tokeny
3. Pokud ne, permission request selhal

**Krok 4:** Test manuálního odeslání

```bash
# Zavolej API přímo
curl -X POST https://weblyx.cz/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN_HERE",
    "notification": {
      "title": "Test",
      "body": "Test notification"
    }
  }'
```

---

### ❌ Offline mode nefunguje

**Příčina:** Service Worker se neregistroval

**Řešení:**
1. Zkontroluj Console: `✅ Service Worker registered`
2. Zkontroluj že `/sw.js` existuje
3. Hard refresh (Cmd/Ctrl + Shift + R)
4. Unregister + Re-register:

```javascript
// V DevTools Console
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));

// Reload
location.reload();
```

---

## 📈 Monitoring

### Resend Dashboard

- [resend.com/emails](https://resend.com/emails) - Email delivery status

### Firebase Console

- **Cloud Messaging** → Usage statistics
- **Firestore** → `fcmTokens` collection
- **Firestore** → `leads` collection

### Vercel Analytics

- PWA install events
- Page load performance
- Offline usage stats

---

## 🚀 Production Checklist

Před nasazením do produkce zkontroluj:

- [ ] `manifest.json` má správné `start_url` (produkční URL)
- [ ] Firebase credentials v Vercel env variables
- [ ] HTTPS enabled (Vercel automaticky)
- [ ] Service Worker funguje v produkci
- [ ] Push notifikace fungují na skutečných zařízeních
- [ ] Ikony jsou optimalizované (512x512 max 100KB)
- [ ] Offline stránka má správný design
- [ ] FCM tokens se ukládají do Firestore
- [ ] Admin dostává email + push při nové poptávce

---

## 🎉 Hotovo!

Teď máš plně funkční mobilní admin aplikaci pro Weblyx!

**Features:**
- ✅ Instalace na mobil jedním kliknutím
- ✅ Offline režim - funguje bez internetu
- ✅ Push notifikace při nové poptávce
- ✅ Rychlá jako native app
- ✅ Žádný App Store review process
- ✅ Automatické updaty (stačí deploy)

**Next steps:**
- Otestuj na různých zařízeních (Android, iOS, Desktop)
- Nasaď na Vercel produkci
- Sdílej install link s týmem
- Začni dostávat instant notifikace o poptávkách! 🚀

---

## 📚 Další Dokumentace

- [PWA Best Practices](https://web.dev/pwa/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)
