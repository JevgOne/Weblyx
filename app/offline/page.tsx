'use client';

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-12 text-center">
        <WifiOff className="h-16 w-16 mx-auto mb-6 text-gray-400" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Nejste online
        </h1>
        <p className="text-gray-600 mb-8">
          Zkontrolujte připojení k internetu a zkuste to znovu.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Zkusit znovu
        </button>
      </div>
    </div>
  );
}
