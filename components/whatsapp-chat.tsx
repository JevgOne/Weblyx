'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);

  // WhatsApp number - replace with your actual number (format: country code + number without +)
  const phoneNumber = '420702110166';
  const defaultMessage = 'Ahoj! Mám zájem o tvorbu webu. Můžete mi poradit?';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="mb-4 w-80 rounded-2xl bg-white shadow-2xl border border-primary/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Weblyx</h3>
                    <p className="text-xs text-white/80">Obvykle odpovídáme do 5 minut</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 p-1 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Message Bubble */}
            <div className="p-4 bg-[#ECE5DD]">
              <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                <p className="text-sm text-gray-700 mb-1">
                  👋 Ahoj! Jak vám můžeme pomoci?
                </p>
                <p className="text-xs text-gray-500">
                  Napište nám na WhatsApp a rádi vám poradíme s tvorbou webu.
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Právě teď</p>
            </div>

            {/* CTA Button */}
            <div className="p-4 bg-white border-t">
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                Napsat na WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          aria-label="WhatsApp Chat"
        >
          {/* Pulsing animation */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping"></span>

          {/* Icon */}
          <MessageCircle className="relative h-6 w-6 transition-transform group-hover:scale-110" />

          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold border-2 border-white">
            1
          </span>
        </button>
      </div>
    </>
  );
}
