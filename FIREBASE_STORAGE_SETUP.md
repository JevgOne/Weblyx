# 🔥 Firebase Storage - Nastavení pro nahrávání obrázků

## Problém
Admin panel neumožňuje nahrávat obrázky do portfolia/blogu, protože Firebase Storage nemá nastavená security pravidla.

## Řešení (2 minuty)

### Krok 1: Otevři Firebase Console
👉 **https://console.firebase.google.com/project/weblyx-prod-38054/storage/rules**

### Krok 2: Klikni na "Rules" tab (pokud už tam nejsi)

### Krok 3: Nahraď stávající pravidla tímto kódem:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Portfolio obrázky - čtení pro všechny, zápis jen pro přihlášené
    match /portfolio/{imageId} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
    
    // Blog obrázky - čtení pro všechny, zápis jen pro přihlášené
    match /blog/{imageId} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
  }
}
```

### Krok 4: Klikni "Publish" (modré tlačítko vpravo nahoře)

### Krok 5: Potvrď změny

## ✅ Hotovo!

Teď můžeš v admin panelu nahrávat obrázky do portfolia a blogu.

---

## 🔓 ALTERNATIVA: Dočasné otevření (pro testování)

Pokud chceš rychle otestovat bez autentizace:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **POZOR:** Toto je NEZABEZPEČENÉ! Používej jen pro testování, pak to změň na bezpečnou verzi výše.

---

## 📝 Co dělají pravidla?

- `allow read: if true` = Kdokoliv může ČÍST (zobrazit) obrázky na webu
- `allow write: if request.auth != null` = Pouze PŘIHLÁŠENÍ uživatelé (admin) mohou nahrávat
- `match /portfolio/{imageId}` = Platí jen pro složku `portfolio/`
- `match /blog/{imageId}` = Platí jen pro složku `blog/`

