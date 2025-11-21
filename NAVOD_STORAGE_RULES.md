# 📸 Návod: Jak nasadit Firebase Storage Rules (krok za krokem)

## 🎯 Co potřebuješ udělat

Nasadit pravidla pro Firebase Storage, aby fungovalo nahrávání obrázků v admin panelu.

---

## ⚡ METODA 1: Firebase Console (NEJRYCHLEJŠÍ - 2 minuty)

### Krok 1: Otevři Firebase Console

Klikni na tento odkaz:
👉 **https://console.firebase.google.com/project/weblyx-prod-38054/storage/rules**

*(Možná budeš muset přihlásit účet Google, který má přístup k Firebase projektu)*

---

### Krok 2: Uvidíš editor s pravidly

Měl bys vidět něco jako:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

### Krok 3: SMAŽ vše a vlož NOVÁ pravidla

**Vyber vše** (Cmd+A / Ctrl+A) a **smaž to**.

Pak **zkopíruj a vlož** následující:

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

---

### Krok 4: Klikni "Publish"

Nahoře vpravo by mělo být tlačítko **"Publish"** (nebo "Publikovat").

**Klikni na něj!**

Měl bys vidět potvrzení typu:
```
✓ Rules published successfully
```

---

### Krok 5: HOTOVO! ✅

Pravidla jsou nasazená. Teď zkus:

1. Jdi na: **http://localhost:3000/admin/login**
2. Přihlaš se jako admin
3. Jdi na: **http://localhost:3000/admin/portfolio/new**
4. Zkus nahrát obrázek

Pokud to funguje → **Gratuluju!** 🎉

---

## 🛠️ METODA 2: Firebase CLI (pokud preferuješ terminál)

### Krok 1: Nainstaluj Firebase Tools (pokud ještě nemáš)

```bash
npm install -g firebase-tools
```

*(Pokud dostaneš permission error, použij `sudo` nebo nainstaluj lokálně: `npm install firebase-tools`)*

---

### Krok 2: Přihlaš se do Firebase

```bash
firebase login
```

Otevře se browser, kde se přihlásíš Google účtem.

---

### Krok 3: Ujisti se, že jsi v projektu weblyx

```bash
cd /Users/zen/weblyx
```

---

### Krok 4: Nasaď storage rules

```bash
firebase deploy --only storage
```

Měl bys vidět:

```
=== Deploying to 'weblyx-prod-38054'...

i  deploying storage
i  storage: reading storage.rules...
✔  storage: rules file storage.rules compiled successfully
✔  storage: released rules storage.rules to firebase.storage/weblyx-prod-38054.appspot.com

✔  Deploy complete!
```

---

### Krok 5: HOTOVO! ✅

Rules jsou nasazené.

---

## 🔍 METODA 3: Ruční kontrola (pokud si nejsi jistý)

### Zkontroluj aktuální pravidla:

1. Jdi na: **https://console.firebase.google.com/project/weblyx-prod-38054/storage**
2. Vlevo klikni na záložku **"Rules"**
3. Uvidíš aktuální pravidla
4. Měla by obsahovat sekce pro `portfolio` a `blog` s wildcards `{imageId=**}`

---

## ❓ Časté problémy

### Problém 1: "Permission Denied" při uploadu

**Řešení:**
- Ujisti se, že jsi přihlášený v admin panelu
- Zkontroluj, že rules obsahují: `allow write, delete: if request.auth != null;`

---

### Problém 2: "403 Forbidden" nebo "Storage bucket not found"

**Řešení:**
- Zkontroluj `.env.local`, že máš správný bucket:
  ```
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=weblyx-prod-38054.firebasestorage.app
  ```
- Nebo zkus:
  ```
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=weblyx-prod-38054.appspot.com
  ```

---

### Problém 3: Rules se nezobrazují v Console

**Řešení:**
- Ujisti se, že jsi na správném projektu: `weblyx-prod-38054`
- Zkus reload stránky (F5)
- Zkontroluj, že máš admin přístup k Firebase projektu

---

## 📋 Checklist - Co musíš zkontrolovat

- [ ] Otevřel jsi Firebase Console na správném projektu
- [ ] Vložil jsi CELÁ pravidla (všechny 3 sekce: portfolio, blog, default)
- [ ] Kliknul jsi "Publish"
- [ ] Viděl jsi potvrzení o úspěšném nasazení
- [ ] Zkusil jsi nahrát obrázek v admin panelu
- [ ] Obrázek se nahrál bez chyby

---

## 🆘 Pokud nic nefunguje

### Poslední možnost - Screenshot debug:

1. Zkus nahrát obrázek v admin panelu
2. Otevři Browser Console (F12 → Console tab)
3. Pošli mi screenshot chyby
4. Nebo pošli mi text chyby, která se zobrazí

Nejčastější chyby:
- `FirebaseError: Missing or insufficient permissions`
  → Rules nejsou nasazené nebo jsou špatně

- `FirebaseError: User does not have permission to access...`
  → Nejsi přihlášený jako admin

- `FirebaseError: Storage bucket not found`
  → Špatný bucket name v `.env.local`

---

## ✅ Jak poznat, že to funguje?

1. V admin panelu klikneš na upload obrázku
2. Vybereš soubor
3. Vidíš progress bar
4. **Zobrazí se náhled obrázku**
5. Po uložení se obrázek zobrazí na webu

---

## 🎓 Co pravidla dělají (pro pochopení)

```javascript
match /portfolio/{imageId=**} {
  allow read: if true;                    // ✅ Kdokoliv může číst (zobrazit obrázek)
  allow write, delete: if request.auth != null;  // 🔒 Jen přihlášení mohou nahrávat
}
```

- `{imageId=**}` = wildcard, umožňuje vnořené cesty (např. `portfolio/2025/image.jpg`)
- `request.auth != null` = kontroluje, jestli je uživatel přihlášený
- `allow read: if true` = veřejné čtení (potřebné pro zobrazení na webu)

---

## 📞 Kontakt

Pokud stále nefunguje, pošli mi:
1. Screenshot Firebase Console (rules editor)
2. Screenshot Browser Console (chyba při uploadu)
3. Obsah `.env.local` (pouze řádek `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`)

---

**Poslední update:** 2025-11-21
**Autor:** Claude Code
