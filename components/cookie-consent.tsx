"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = Cookies.get("cookie-consent");
    if (!consent) {
      // Delay showing popup for better UX
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        // Invalid JSON, show popup again
        setIsVisible(true);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveCookies(allAccepted);
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    saveCookies(necessaryOnly);
    setIsVisible(false);
  };

  const saveCustomPreferences = () => {
    saveCookies(preferences);
    setIsVisible(false);
  };

  const saveCookies = (prefs: typeof preferences) => {
    // Save for 365 days
    Cookies.set("cookie-consent", JSON.stringify(prefs), { expires: 365 });

    // Set analytics/marketing cookies based on preferences
    if (prefs.analytics) {
      // Enable Google Analytics or other analytics
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      // Enable marketing cookies
      console.log("Marketing enabled");
    }
  };

  if (!isVisible) return null;

  return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-2xl border border-border bg-background/95 backdrop-blur-lg shadow-2xl overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />

            <div className="p-6 sm:p-8">
              {!showSettings ? (
                // Main consent view
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Cookie className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold">Používáme cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Používáme cookies pro zajištění základní funkčnosti webu a pro analýzu návštěvnosti.
                      Více informací najdete v našich{" "}
                      <Link href="/ochrana-udaju" className="text-primary hover:underline">
                        zásadách ochrany osobních údajů
                      </Link>
                      {" "}a{" "}
                      <Link href="/cookies" className="text-primary hover:underline">
                        zásadách cookies
                      </Link>
                      .
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(true)}
                      className="w-full sm:w-auto"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Nastavení
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={acceptNecessary}
                      className="w-full sm:w-auto"
                    >
                      Pouze nezbytné
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={acceptAll}
                      className="w-full sm:w-auto"
                    >
                      Přijmout vše
                    </Button>
                  </div>
                </div>
              ) : (
                // Settings view
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Nastavení cookies</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Necessary cookies */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/50">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">Nezbytné cookies</p>
                        <p className="text-xs text-muted-foreground">
                          Tyto cookies jsou nezbytné pro správné fungování webu a nelze je vypnout.
                          Zahrnují základní funkce jako bezpečnost a přístupnost.
                        </p>
                      </div>
                    </div>

                    {/* Analytics cookies */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="mt-1 cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">Analytické cookies</p>
                        <p className="text-xs text-muted-foreground">
                          Pomáhají nám pochopit, jak návštěvníci používají web, abychom mohli
                          zlepšovat jeho funkčnost a obsah.
                        </p>
                      </div>
                    </div>

                    {/* Marketing cookies */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({ ...preferences, marketing: e.target.checked })
                        }
                        className="mt-1 cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">Marketingové cookies</p>
                        <p className="text-xs text-muted-foreground">
                          Používají se k zobrazení relevantních reklam a marketingových kampaní
                          na základě vašich preferencí.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(false)}
                      className="flex-1"
                    >
                      Zpět
                    </Button>
                    <Button variant="outline" onClick={saveCustomPreferences} className="flex-1">
                      Uložit nastavení
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
