'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Chyba v administraci</h1>
          <p className="text-muted-foreground">
            Došlo k chybě. Zkuste obnovit stránku nebo se vraťte na dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Kód: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Zkusit znovu
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin'}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
