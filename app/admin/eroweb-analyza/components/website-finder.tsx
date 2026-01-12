'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress'; // Not available
import { Search, CheckCircle2, XCircle, Loader2, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WebsiteFinder {
  onWebsitesFound?: () => void;
}

interface FindResult {
  success: boolean;
  found: number;
  created: number;
  errors: number;
  websites: Array<{
    domain: string;
    source: string;
    businessType?: string;
    title?: string;
  }>;
  createdDomains?: string[];
  errorDomains?: string[];
}

export function WebsiteFinder({ onWebsitesFound }: WebsiteFinder) {
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<FindResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFindWebsites = async () => {
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/eroweb/find-websites', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to find websites');
      }

      const data: FindResult = await res.json();
      setResult(data);

      if (data.created > 0 && onWebsitesFound) {
        onWebsitesFound();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Automatické vyhledávání webů
        </CardTitle>
        <CardDescription>
          Najde nové konkurenční weby z veřejných seznamů a automaticky je přidá k analýze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleFindWebsites}
          disabled={isSearching}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Vyhledávám...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Najít nové weby
            </>
          )}
        </Button>

        {isSearching && (
          <div className="space-y-2">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Prohledávám veřejné seznamy...
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Chyba při vyhledávání</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-foreground">{result.found}</p>
                <p className="text-xs text-muted-foreground">Nalezeno</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-green-600">{result.created}</p>
                <p className="text-xs text-muted-foreground">Přidáno</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-yellow-600">{result.errors}</p>
                <p className="text-xs text-muted-foreground">Chyby</p>
              </div>
            </div>

            {/* Success Message */}
            {result.created > 0 && (
              <div className="flex items-start gap-2 p-4 border border-green-500/50 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Úspěšně přidáno {result.created} nových webů!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Weby jsou připraveny k analýze. Můžeš je najít v historii jako "pending".
                  </p>
                </div>
              </div>
            )}

            {/* No New Websites */}
            {result.found === 0 && (
              <div className="flex items-start gap-2 p-4 border border-border bg-muted/50 rounded-lg">
                <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Žádné nové weby nenalezeny
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Všechny dostupné weby již byly analyzovány. Zkus to znovu později.
                  </p>
                </div>
              </div>
            )}

            {/* Website List */}
            {result.websites && result.websites.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Nalezené weby:</p>
                <div className="max-h-64 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-background/30">
                  {result.websites.slice(0, 20).map((website, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {website.title || website.domain}
                        </p>
                        <p className="text-xs text-muted-foreground">{website.domain}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {website.source}
                        </Badge>
                        {result.createdDomains?.includes(website.domain) && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {result.errorDomains?.includes(website.domain) && (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                  {result.websites.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      + dalších {result.websites.length - 20} webů
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 mt-4 pt-4 border-t border-border">
          <p className="font-medium">Zdroje:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>erosservis.cz - katalog erotických služeb</li>
            <li>eroticke-masaze.cz - seznam masáží</li>
            <li>erotic-list.cz - adresář</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
