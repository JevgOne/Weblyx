# 📦 Jak Nasadit Firebase Storage Rules

Storage Rules musíš nasadit do Firebase Console, aby fungovaly uploady fotek v admin panelu.

## ✅ Krok za krokem:

### 1️⃣ Otevři Firebase Console
Jdi na: **https://console.firebase.google.com**

### 2️⃣ Vyber projekt
- Klikni na projekt **"weblyx-prod-38054"**

### 3️⃣ Otevři Storage Rules
- V levém menu klikni na **"Storage"** (ikona složky)
- Nahoře klikni na záložku **"Rules"**

### 4️⃣ Zkopíruj Storage Rules
Otevři soubor `storage.rules` a zkopíruj CELÝ obsah

### 5️⃣ Vlož do Firebase Console
- **Smaž** veškerý starý obsah v editoru
- **Vlož** zkopírovaný obsah ze souboru `storage.rules`

### 6️⃣ Publikuj
- Klikni na tlačítko **"Publish"** (nebo "Publikovat")
- Počkej než se objeví ✅ potvrzení

## 🎉 Hotovo!

Teď můžeš v admin panelu nahrávat fotky do:
- Portfolio (`/admin/portfolio/new`)
- Blog (`/admin/blog/new`)
- Služby (`/admin/content/services`)

---

## 🚨 Pokud to nefunguje:

1. Zkontroluj že jsi přihlášený do Firebase Console se správným účtem
2. Zkontroluj že jsi vybral správný projekt (weblyx-prod-38054)
3. Obnovení stránky - Hard Refresh (Cmd+Shift+R)
4. Vymaž cache prohlížeče

---

## 💡 Alternativa: Použij skript

```bash
node scripts/deploy-storage-rules.js
```

Skript ti ukáže návod krok za krokem!
