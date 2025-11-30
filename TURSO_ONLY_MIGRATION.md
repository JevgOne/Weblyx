# 🚀 TURSO ONLY - Firebase Removed!

## ✅ CO JSEM UDĚLAL:

1. ❌ **Odstranil Firebase Auth** - teď používáš simple cookie auth
2. ❌ **Odstranil Firebase Firestore** - vše v Turso databázi
3. ✅ **Přidal Turso tabulky** - sessions, AI leads fields
4. ✅ **Přepsal všechny API routes** - leads, auth, push notifications

---

## ⚡ RYCHLÝ SETUP (5 minut):

### 1️⃣ Spusť Turso Migrace

```bash
cd /Users/zen/weblyx

# Přihlaš se do Turso (pokud ještě nejsi)
turso auth login

# Spusť migrace
turso db shell weblyx < migrations/003_push_subscriptions.sql
turso db shell weblyx < migrations/004_admin_sessions_and_ai_leads.sql
```

**Co to udělá:**
- Vytvoří `push_subscriptions` tabulku
- Vytvoří `admin_sessions` tabulku
- Přidá sloupce do `leads` pro AI data

---

### 2️⃣ Nastav `.env.local`

```bash
# ====================================
# 🔐 ADMIN AUTHENTICATION
# ====================================
ADMIN_EMAIL=zenuly3@gmail.com
ADMIN_PASSWORD=TvojeSilneHeslo123

# ====================================
# 📧 EMAIL NOTIFICATIONS (Resend)
# ====================================
RESEND_API_KEY=re_tvuj_resend_klic
RESEND_FROM_EMAIL=noreply@weblyx.cz

# ====================================
# 🤖 AI GENERATION (Google Gemini)
# ====================================
# Get API key from: https://aistudio.google.com/app/apikey
# Used for: AI design generation, brief generation, alt text generation
GEMINI_API_KEY=tvuj_gemini_klic

# ====================================
# 📱 PWA & PUSH NOTIFICATIONS (Web Push)
# ====================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBjgjmPDIUVGAW95sbsKbpi0sepS2rLKkVclgHYu0vItKEFQaWaAON3IAPiobfHg673X4_RUZUAnVJ1_5GAEoqA
VAPID_PRIVATE_KEY=r1aP1mo7kHbEpKF2e4JFSLFB-Xe2wp88vFWu4KVQ7qk

# ====================================
# 🗄️ TURSO DATABASE
# ====================================
TURSO_DATABASE_URL=libsql://weblyx-jevgone.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=tvuj_turso_token

# ====================================
# 📦 VERCEL BLOB (pro obrázky)
# ====================================
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# ====================================
# 🌐 SITE
# ====================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Weblyx
```

---

### 3️⃣ Restartuj Server

```bash
npm run dev
```

---

### 4️⃣ Test Přihlášení

1. Otevři: `http://localhost:3000/admin/login`
2. Email: `zenuly3@gmail.com`
3. Heslo: `TvojeSilneHeslo123` (z `.env.local`)
4. Klikni "Přihlásit se"

**Mělo by fungovat!** ✅

---

## 📱 PWA Mobile Admin:

### Instalace:

**Link:** `https://weblyx.cz/admin`

1. Otevři na mobilu v Chrome/Safari
2. Klikni "Instalovat Weblyx Admin"
3. Hotovo! Aplikace na hlavní obrazovce

### Push Notifikace:

1. Jdi do `/admin/leads`
2. Klikni "Zapnout push notifikace"
3. Povolít v prohlížeči
4. Done! Dostáváš notifikace při nové poptávce

---

## 🗄️ Turso Tabulky (Co Máš):

```
✅ leads - všechny poptávky + AI data
✅ admin_sessions - session management
✅ push_subscriptions - Web Push tokens
✅ projects - projekty
✅ blog_posts - blog články
✅ portfolio - portfolio items
✅ reviews - recenze
✅ ... + 20 dalších CMS tabulek
```

---

## 🚀 Production Deploy (Vercel):

```bash
# Nastav env variables
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add RESEND_API_KEY production
vercel env add GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production
vercel env add VAPID_PRIVATE_KEY production

# Deploy
vercel --prod
```

---

## 📧 Email Flow (Automatický):

```
Nová poptávka
    ↓
💾 Ulož do Turso
    ↓
📧 Email adminovi (Resend)
    ↓
🔔 Push notifikace (Web Push)
    ↓
🤖 AI Design generation (Gemini)
    ↓
🤖 AI Brief generation (Gemini)
    ↓
📧 Email klientovi s AI návrhy
```

---

## ❌ CO UŽ NEPOUŽÍVÁŠ:

- ❌ Firebase Auth
- ❌ Firebase Firestore
- ❌ Firebase Cloud Messaging
- ❌ Firebase Admin SDK

## ✅ CO TEĎ POUŽÍVÁŠ:

- ✅ **Turso** (SQLite) - všechna data
- ✅ **Cookie Auth** - simple & fast
- ✅ **Web Push API** - notifikace
- ✅ **Resend** - emaily
- ✅ **Gemini AI** - AI návrhy
- ✅ **Vercel Blob** - obrázky

---

## 🐛 Troubleshooting:

### Přihlášení nefunguje?

1. Zkontroluj `.env.local`:
   ```bash
   cat .env.local | grep ADMIN
   ```
2. Restartuj server: `npm run dev`
3. Clear cookies v prohlížeči

### Turso migrace selhala?

```bash
# Zkontroluj tabulky
turso db shell weblyx "SELECT name FROM sqlite_master WHERE type='table';"

# Měl bys vidět: leads, admin_sessions, push_subscriptions, ...
```

### Push notifikace nefungují?

1. Zkontroluj VAPID klíče v `.env.local`
2. Povolil jsi notifikace v prohlížeči?
3. Spustil jsi push_subscriptions migration?

---

## 🎉 HOTOVO!

Teď máš **100% Turso setup** bez Firebase! Web bude **mnohem rychlejší**.

**Next steps:**
1. ✅ Spusť migrace
2. ✅ Nastav `.env.local`
3. ✅ Test přihlášení
4. ✅ Deploy na Vercel
5. ✅ Instaluj PWA na mobil
6. 🚀 Začni dostávat poptávky!

---

## 📚 Další Info:

- **PWA Setup:** `/PWA_MOBILE_ADMIN_SETUP.md`
- **Email Notifications:** `/EMAIL_NOTIFICATIONS_SETUP.md`
- **Turso Schema:** `/turso-schema.sql`
