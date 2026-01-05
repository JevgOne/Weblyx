# 🌟 Google Reviews Integration - Setup Guide

Tento návod ti ukáže, jak propojit skutečné Google recenze s webem Weblyx.

---

## 📋 Krok 1: Získej Google API Key

### 1.1 Vytvoř Google Cloud projekt

1. Jdi na [Google Cloud Console](https://console.cloud.google.com/)
2. Klikni na "Select a project" → "New Project"
3. Pojmenuj projekt (např. "Weblyx Reviews")
4. Klikni "Create"

### 1.2 Aktivuj Places API

1. V levém menu: **APIs & Services** → **Enable APIs and Services**
2. Vyhledej "**Places API**"
3. Klikni na "**Places API**" (NEW)
4. Klikni "**Enable**"

### 1.3 Vytvoř API Key

1. V levém menu: **APIs & Services** → **Credentials**
2. Klikni "**+ Create Credentials**" → "**API Key**"
3. **DŮLEŽITÉ**: Klikni na nově vytvořený klíč → "**Edit API Key**"
4. **Application restrictions**:
   - Vyber "**HTTP referrers (web sites)**"
   - Přidej: `https://www.weblyx.cz/*` a `https://seitelyx.de/*`
5. **API restrictions**:
   - Vyber "**Restrict key**"
   - Zaškrtni pouze "**Places API (NEW)**"
6. Klikni "**Save**"
7. **Zkopíruj API Key** (např. `AIzaSyC1234567890abcdefghijk`)

---

## 📍 Krok 2: Získej Google Place ID

### 2.1 Najdi své místo na Google Maps

1. Jdi na [Google Maps](https://www.google.com/maps)
2. Vyhledej svou firmu: "**Weblyx**"
3. Klikni na svou firmu

### 2.2 Zkopíruj Place ID

**Varianta A: Z URL**
```
https://www.google.com/maps/place/?q=place_id:ChIJRXDG3wC5S0cRFZIz5-vFbHY
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           Tohle je tvoje Place ID
```

**Varianta B: Place ID Finder**
1. Jdi na [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Vyhledej svou firmu
3. Zkopíruj "Place ID"

---

## ⚙️ Krok 3: Nastav Environment Variables

### 3.1 Lokální vývoj (.env.local)

Vytvoř nebo uprav `/Users/zen/weblyx/.env.local`:

```bash
# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSyC1234567890abcdefghijk
GOOGLE_PLACE_ID=ChIJRXDG3wC5S0cRFZIz5-vFbHY
```

### 3.2 Production (Vercel)

1. Jdi na [Vercel Dashboard](https://vercel.com/)
2. Vyber projekt "**weblyx**"
3. **Settings** → **Environment Variables**
4. Přidej:
   - **Name**: `GOOGLE_PLACES_API_KEY`
   - **Value**: `AIzaSyC1234567890abcdefghijk`
   - **Environment**: Production, Preview, Development
5. Přidej:
   - **Name**: `GOOGLE_PLACE_ID`
   - **Value**: `ChIJRXDG3wC5S0cRFZIz5-vFbHY`
   - **Environment**: Production, Preview, Development
6. Klikni "**Save**"
7. **Redeploy** projekt (Settings → Deployments → ... → Redeploy)

---

## 🧪 Krok 4: Testování

### 4.1 Test lokálně

```bash
cd /Users/zen/weblyx
npm run dev
```

Otevři: http://localhost:3000/

Scroll k sekci "**Co říkají naši klienti**" - měly by se načíst Google recenze.

### 4.2 Test API endpoint

```bash
curl http://localhost:3000/api/google-reviews
```

Očekávaný output:
```json
{
  "success": true,
  "data": {
    "name": "Weblyx",
    "rating": 5.0,
    "totalReviews": 7,
    "reviews": [...]
  }
}
```

### 4.3 Debug

Pokud to nefunguje, zkontroluj browser console (F12):

```javascript
// Mělo by vrátit recenze
fetch('/api/google-reviews').then(r => r.json()).then(console.log)
```

---

## 🔧 Pokročilé nastavení

### Přepínání mezi Google a Turso recenzemi

V `/Users/zen/weblyx/components/home/reviews.tsx`:

```typescript
// Set to true to use Google Reviews, false to use Turso DB reviews
const USE_GOOGLE_REVIEWS = true;  // ← Změň na false pro Turso DB
```

### Změna počtu zobrazených recenzí

V `/Users/zen/weblyx/components/google-reviews/GoogleReviewsList.tsx`:

```typescript
setReviews(data.data.reviews.slice(0, 6)); // ← Změň číslo
```

---

## 💰 Ceny Google Places API

**ZDARMA:**
- **0 - 100 000** požadavků/měsíc
- **Weblyx**: ~3 000 návštěv/měsíc = ~3 000 požadavků
- **Cache**: 1 hodina = max ~720 požadavků/měsíc
- **Závěr**: ✅ ZDARMA

**Pokud překročíš 100k:**
- $17 za 1000 požadavků navíc

**Doporučení:** Sleduj na [Google Cloud Console](https://console.cloud.google.com/billing)

---

## 🛡️ Bezpečnost

✅ **Co jsme udělali:**
- API key restricted na `weblyx.cz` a `seitelyx.de`
- API key restricted jen na Places API
- Rate limiting: 1 hodina cache
- Server-side rendering kde je to možné

❌ **NIKDY:**
- Nesdílej API key veřejně
- Necommituj `.env.local` do Gitu (už je v `.gitignore`)

---

## 📚 Užitečné odkazy

- [Google Cloud Console](https://console.cloud.google.com/)
- [Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

**Hotovo!** 🎉 Teď máš Google recenze propojené s webem.
