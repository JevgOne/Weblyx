# 📊 Facebook Pixel Setup Guide

Facebook Pixel je teď nainstalovaný na webu Weblyx. Stačí přidat Pixel ID do Vercel environment variables.

## ✅ Co je hotovo

- ✅ Facebook Pixel base script v `layout.tsx`
- ✅ Automatický PageView tracking na všech stránkách
- ✅ Lead tracking na CTA tlačítkách "Nezávazná poptávka"
- ✅ Helper funkce `trackLeadEvent()` pro další tracking

## 📋 Jak aktivovat tracking

### 1. Získat Facebook Pixel ID

1. Jdi na [Facebook Business Manager](https://business.facebook.com/)
2. Zvol **Events Manager**
3. Vyber nebo vytvoř nový Pixel
4. Zkopíruj **Pixel ID** (číslo jako `1234567890123456`)

### 2. Přidat Pixel ID do Vercel

```bash
# Příkaz pro přidání env variable
vercel env add NEXT_PUBLIC_FB_PIXEL_ID

# Zadej hodnotu: tvoje Pixel ID
# Zvol: Production + Preview + Development
```

**Nebo přes Vercel Dashboard:**
1. Jdi na https://vercel.com/jevg-ones-projects/weblyx/settings/environment-variables
2. Klikni "Add New"
3. Name: `NEXT_PUBLIC_FB_PIXEL_ID`
4. Value: `tvoje-pixel-id`
5. Environments: ✅ Production, ✅ Preview, ✅ Development

### 3. Redeploy projektu

```bash
vercel --prod
```

## 🎯 Co se trackuje

### Automaticky:

#### 1. **PageView** (každá stránka)
- Automaticky při načtení stránky
- Trackuje všechny navigace
- Sleduje celkovou návštěvnost

#### 2. **Lead** (CTA tlačítka)
Trackuje kliknutí na tlačítka "Nezávazná poptávka":
- ✅ Hero section (homepage)
- ✅ CTA Section (homepage)
- ✅ Všechna primární CTA tlačítka

## 🧪 Jak otestovat

### Test 1: Facebook Pixel Helper Extension

1. Nainstaluj [Facebook Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Otevři https://weblyx.cz
3. Klikni na extension icon
4. Měl bys vidět:
   - ✅ **PageView** event
   - ✅ Pixel ID
   - Status: "No Errors"

### Test 2: Lead Event Tracking

1. Otevři https://weblyx.cz
2. Otevři Developer Tools → Console
3. Klikni na tlačítko "Nezávazná konzultace zdarma"
4. V konzoli bys měl vidět:
   ```
   ✅ Facebook Pixel: Lead event tracked
   ```
5. V Facebook Pixel Helper by se měl objevit **Lead** event

### Test 3: Facebook Events Manager

1. Jdi na Facebook Events Manager
2. Zvol svůj Pixel
3. Klikni "Test Events"
4. Otevři https://weblyx.cz v novém tabu
5. Měl bys vidět real-time events:
   - PageView
   - Lead (po kliknutí na CTA)

## 🔧 Další možnosti tracking

### Přidat tracking na vlastní tlačítka

Použij komponentu `LeadButton` místo běžného Button:

```tsx
import { LeadButton } from '@/components/tracking/LeadButton';

// Místo tohoto:
<Button asChild>
  <Link href="/poptavka">Kontaktujte nás</Link>
</Button>

// Použij toto:
<LeadButton href="/poptavka">
  Kontaktujte nás
</LeadButton>
```

### Manuální tracking v custom komponentě

```tsx
'use client';

import { trackLeadEvent } from '@/components/analytics/FacebookPixel';

function MyCustomButton() {
  const handleClick = () => {
    // Tvoje custom logika...

    // Track Facebook Pixel event
    trackLeadEvent();
  };

  return <button onClick={handleClick}>Klikni</button>;
}
```

## 📂 Struktura souborů

```
components/
├── analytics/
│   └── FacebookPixel.tsx      # Base Pixel initialization
└── tracking/
    └── LeadButton.tsx          # Button wrapper s auto-tracking

app/
└── layout.tsx                  # FacebookPixel component import

components/home/
├── hero.tsx                    # LeadButton v hero CTA
└── cta-section.tsx            # LeadButton v CTA section
```

## ⚠️ Poznámky

- Pixel ID **musí** začínat s `NEXT_PUBLIC_` aby byl viditelný v browseru
- Bez Pixel ID se tracking automaticky vypne (warning v build logu)
- V development mode uvidíš tracking v konzoli
- V production mode se data posílají do Facebook

## 🚀 Hotovo!

Po nastavení Pixel ID by měl Facebook tracking automaticky fungovat. Data uvidíš v Facebook Events Manager během několika minut.
