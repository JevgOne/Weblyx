# 🔥 KRITICKÉ: Nasaď Storage Rules HNED

**PROČ:** Bez toho nefungují uploady fotek v admin panelu!

---

## 📋 KROK ZA KROKEM (5 minut):

### 1️⃣ Otevři Firebase Console
Klikni na tento link:
**https://console.firebase.google.com/project/weblyx-prod-38054/storage/weblyx-prod-38054.firebasestorage.app/rules**

### 2️⃣ Zkopíruj Storage Rules
Níže je obsah souboru `storage.rules` - **zkopíruj CELÝ text**:

```
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

    // Services images - allow upload for authenticated users (admin)
    match /services/{imageId=**} {
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

### 3️⃣ Vlož do Firebase Console
- **SMAŽ** všechen starý obsah v editoru Rules
- **VLOŽ** zkopírovaný text ze step 2 (Cmd+V)

### 4️⃣ Publikuj
- Klikni na tlačítko **"Publish"** (vpravo nahoře)
- Počkej než se objeví ✅ zelená hláška "Rules successfully published"

---

## ✅ OVĚŘ ŽE TO FUNGUJE:

Po publikování:

1. Jdi na: **https://weblyx.cz/admin/portfolio/new**
2. Zkus nahrát obrázek
3. Měl by se nahrát **za pár sekund** (ne timeout)
4. Uvidíš preview obrázku

---

## 🚨 POKUD TO STÁLE NEFUNGUJE:

1. **Hard refresh stránky:** Cmd+Shift+R (Mac) nebo Ctrl+Shift+F5 (Windows)
2. **Smaž cache prohlížeče**
3. **Odhlásit se a znovu přihlásit** do admin panelu
4. **Zkontroluj že jsi publikoval Rules** - v Firebase Console by měl být zelený status

---

## 💡 PROČ TO MUSÍ BÝT TAKHLE:

Firebase má **3 různé úrovně oprávnění**:
- **Service Account** (který používáme pro API) - **nemá** oprávnění nasadit Rules
- **Firebase CLI** - potřebuje **Owner** oprávnění
- **Firebase Console** (web UI) - tady to můžeš udělat **i jako Editor**

Proto je **manuální nasazení přes Console JEDINÁ cesta** v tuhle chvíli.

---

**Až to budeš mít hotové, napiš mi "hotovo" a já ověřím že to funguje!** ✅
