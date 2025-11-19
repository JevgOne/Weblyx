# 🔥 Firebase Quick Setup - 5 minut

## Krok 1: Vytvoř Firebase projekt (2 min)

1. **Jdi na:** https://console.firebase.google.com
2. **Klikni:** "Add project" nebo "Přidat projekt"
3. **Název:** `weblyx` (nebo jak chceš)
4. **Google Analytics:** ✅ Enable (doporučeno)
5. **Počkej 30 sekund** na vytvoření

---

## Krok 2: Registrace Web App

1. V Firebase Console → **Přehled projektu** (nahoře)
2. Klikni na **Web ikonu** `</>`
3. **Nickname:** `weblyx-web`
4. **Firebase Hosting:** ❌ Ne (už máme Vercel)
5. **Klikni:** "Register app"

**Zkopíruj config** (vypadá takto):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "weblyx-xxxx.firebaseapp.com",
  projectId: "weblyx-xxxx",
  storageBucket: "weblyx-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx",
  measurementId: "G-XXXXXXXXX"
};
```

---

## Krok 3: Firestore Database

1. V levém menu → **Build** → **Firestore Database**
2. **Klikni:** "Create database"
3. **Location:** `eur3 (europe-west)` - nejblíž ČR
4. **Security rules:** Start in **production mode** (změníme později)
5. Počkej minutku

---

## Krok 4: Authentication

1. V levém menu → **Build** → **Authentication**
2. **Klikni:** "Get started"
3. **Sign-in method** tab
4. **Enable:** Email/Password
   - Klikni na "Email/Password"
   - Toggle ON
   - Save
5. **Přidej prvního admina:**
   - **Users** tab → "Add user"
   - Email: `tvuj@email.cz`
   - Password: (silné heslo)
   - **Zkopíruj UID** uživatele (např. `xYz123ABC...`)

---

## Krok 5: Firestore Security Rules

1. Firestore Database → **Rules** tab
2. **Nahraď** vše tímto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper funkce - je user admin?
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Admins collection - pouze admins mohou číst
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if false; // Pouze přes Firebase Console
    }

    // Leads - kdokoliv může zapsat (public form), admins mohou vše
    match /leads/{leadId} {
      allow create: if true; // Public form submission
      allow read, update, delete: if isAdmin();
    }

    // Projects - pouze admins
    match /projects/{projectId} {
      allow read, write: if isAdmin();

      // Subcollections
      match /todos/{todoId} {
        allow read, write: if isAdmin();
      }
      match /files/{fileId} {
        allow read, write: if isAdmin();
      }
      match /timeline/{eventId} {
        allow read, write: if isAdmin();
      }
      match /milestones/{milestoneId} {
        allow read, write: if isAdmin();
      }
    }

    // Emails - pouze admins
    match /emails/{emailId} {
      allow read, write: if isAdmin();
    }

    // Calendar - pouze admins
    match /calendar_events/{eventId} {
      allow read, write: if isAdmin();
    }

    // Blog posts - public read published, admins full access
    match /blog_posts/{postId} {
      allow read: if resource.data.published == true;
      allow write: if isAdmin();
    }

    // Newsletter subscribers - kdokoliv subscribe, admins read
    match /newsletter_subscribers/{subscriberId} {
      allow create: if true;
      allow read: if isAdmin();
      allow update: if request.auth != null; // Unsubscribe
    }

    // Settings - pouze admins
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
  }
}
```

3. **Publish** rules

---

## Krok 6: Vytvoř admin záznam

1. Firestore Database → **Data** tab
2. **Start collection:** `admins`
3. **Document ID:** (zkopíruj UID tvého uživatele z Authentication)
4. **Field:**
   - Name: `email`
   - Type: string
   - Value: `tvuj@email.cz`
5. **Add field:**
   - Name: `role`
   - Type: string
   - Value: `admin`
6. **Add field:**
   - Name: `createdAt`
   - Type: timestamp
   - Value: (current timestamp)
7. **Save**

---

## Krok 7: Storage (pro file uploady)

1. V levém menu → **Build** → **Storage**
2. **Get started**
3. **Security rules:** Start in **production mode**
4. **Location:** `europe-west`
5. Done!

**Storage Rules** (po vytvoření):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function isAdmin() {
      return request.auth != null &&
             firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    // Project files - pouze admins
    match /projects/{projectId}/{allPaths=**} {
      allow read, write: if isAdmin();
    }

    // Lead files - pouze admins
    match /leads/{leadId}/{allPaths=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## ✅ Hotovo!

Teď mi **pošli firebaseConfig** (ten JSON) a já:
1. Nainstaluju Firebase SDK
2. Vytvořím `.env.local`
3. Připojím authentication
4. Začnu admin panel

---

**Odkud vzít config znovu:**
Firebase Console → ⚙️ Project Settings → Scroll dolů → "Your apps" → Web app → "SDK setup and configuration" → Copy config

---

**🔥 Firebase je připravený!**
