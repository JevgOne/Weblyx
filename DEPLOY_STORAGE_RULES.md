# 🔥 Jak nasadit Firebase Storage Rules

## Proč je to potřeba?

Image upload v admin panelu (portfolio, blog) vyžaduje, aby Firebase Storage měl správná oprávnění.

## ⚡ Rychlé řešení (2 minuty)

### Krok 1: Otevři Firebase Console
👉 **[Klikni sem](https://console.firebase.google.com/project/weblyx-prod-38054/storage/rules)**

### Krok 2: Zkopíruj a vlož následující pravidla

```javascript
rules_version = '2';

// Firebase Storage Security Rules for Weblyx
service firebase.storage {
  match /b/{bucket}/o {

    // Portfolio images - allow upload for authenticated users (admin)
    match /portfolio/{imageId=**} {
      // Allow read for everyone (public website needs to display images)
      allow read: if true;

      // Allow write/delete only for authenticated users
      allow write, delete: if request.auth != null;
    }

    // Blog images - allow upload for authenticated users (admin)
    match /blog/{imageId=**} {
      // Allow read for everyone
      allow read: if true;

      // Allow write/delete only for authenticated users
      allow write, delete: if request.auth != null;
    }

    // Default: deny all other paths
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

### Krok 3: Klikni "Publish"

Hotovo! ✅ Image upload by měl fungovat.

---

## 🛠️ Alternativa: Firebase CLI (pokud máš přístup)

```bash
# 1. Nainstaluj Firebase CLI (pokud ještě není)
npm install -g firebase-tools

# 2. Přihlas se
firebase login

# 3. Nasaď rules
firebase deploy --only storage
```

---

## 🔍 Jak ověřit, že to funguje?

1. Přihlaš se do admin panelu: `/admin/login`
2. Jdi na Portfolio: `/admin/portfolio`
3. Klikni "Nový projekt" nebo edituj existující
4. Zkus nahrát obrázek
5. Pokud se nahraje → **Funguje!** ✅
6. Pokud chyba → Zkontroluj Firebase Console

---

## 📝 Poznámky

- **Důležité**: Wildcard pattern `{imageId=**}` umožňuje vnořené cesty
  - Např: `portfolio/1732170000000_image.jpg`
- Pouze přihlášení uživatelé (`request.auth != null`) mohou uploadovat
- Čtení je veřejné (potřebné pro zobrazení na webu)

## 🔗 Užitečné odkazy

- [Firebase Console - Storage Rules](https://console.firebase.google.com/project/weblyx-prod-38054/storage/rules)
- [Firebase Console - Storage Files](https://console.firebase.google.com/project/weblyx-prod-38054/storage)
- [Firebase Storage Rules Docs](https://firebase.google.com/docs/storage/security)
