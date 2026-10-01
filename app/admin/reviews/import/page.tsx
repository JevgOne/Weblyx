"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, Check, AlertTriangle } from "lucide-react";

/**
 * Paste reviews in, get them on the site.
 *
 * The Places API cannot do this: it needs billing enabled on the Cloud project
 * and returns at most five reviews regardless. The profile has nineteen. So
 * they are pasted — and the reason fourteen of them were never on the site is
 * that adding them meant nineteen passes through a one-at-a-time form.
 *
 * The parser accepts what you actually get when copying from a Google profile:
 * a name line, an optional star line, then the review text, separated by blank
 * lines. It is deliberately forgiving about everything else, because the shape
 * of that copy changes whenever Google redesigns the page.
 */
interface Parsed {
  authorName: string;
  rating: number;
  text: string;
  problem?: string;
}

const STAR_LINE = /^[★⭐*]{1,5}\s*$/u;
const RATING_LINE = /^\s*(\d)\s*(\/\s*5|hvězd|★)/i;

function parseBlock(block: string): Parsed | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    // Noise Google puts between the name and the text.
    .filter((l) => !/^(Místní znalec|Local Guide|\d+ recenz|\d+ fotek|před \d|Nové|NOVÉ)/i.test(l));

  if (lines.length === 0) return null;

  const authorName = lines[0];
  let rating = 5;
  let textFrom = 1;

  if (lines[1]) {
    if (STAR_LINE.test(lines[1])) {
      rating = [...lines[1]].filter((c) => "★⭐*".includes(c)).length;
      textFrom = 2;
    } else {
      const m = lines[1].match(RATING_LINE);
      if (m) {
        rating = Number(m[1]);
        textFrom = 2;
      }
    }
  }

  const text = lines.slice(textFrom).join(" ").trim();

  if (!text) return { authorName, rating, text: "", problem: "chybí text recenze" };
  if (!(rating >= 1 && rating <= 5)) return { authorName, rating, text, problem: "neplatné hodnocení" };
  return { authorName, rating, text };
}

export default function ReviewImportPage() {
  const [raw, setRaw] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: string[]; failed: string[] } | null>(null);
  const [error, setError] = useState("");

  const parsed = useMemo(
    () =>
      raw
        .split(/\n\s*\n/)
        .map(parseBlock)
        .filter((x): x is Parsed => x !== null),
    [raw]
  );
  const usable = parsed.filter((p) => !p.problem);

  const submit = async () => {
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk", items: usable }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Import selhal");
      setResult(data);
      setRaw("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import selhal");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Zkopírujte recenze z Google profilu a vložte je sem. Jedna recenze = jeden
          odstavec oddělený prázdným řádkem.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/reviews">Zpět na recenze</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder={
              "Jan Novák\n★★★★★\nSkvělá spolupráce, web byl hotový za čtyři dny a vypadá přesně podle představ.\n\nPetra Svobodová\n5/5\nRychlá komunikace a cena seděla na to, co jsme si domluvili."
            }
            className="w-full rounded-md border border-input bg-background p-3 font-mono text-sm"
          />

          {parsed.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                Rozpoznáno {parsed.length} recenzí
                {parsed.length !== usable.length && (
                  <span className="font-normal text-amber-600">
                    {" "}· {parsed.length - usable.length} s problémem
                  </span>
                )}
              </p>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {parsed.map((p, i) => (
                  <div
                    key={i}
                    className={`rounded-md border p-3 text-sm ${p.problem ? "border-amber-400 bg-amber-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.authorName}</span>
                      <span className="text-amber-500">{"★".repeat(p.rating)}</span>
                      {p.problem && (
                        <span className="flex items-center gap-1 text-xs text-amber-700">
                          <AlertTriangle className="h-3 w-3" /> {p.problem}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-muted-foreground">{p.text || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={submit} disabled={sending || usable.length === 0} size="lg">
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Nahrávám…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Nahrát {usable.length} recenzí
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30">
          <CardContent className="space-y-2 p-6">
            <p className="flex items-center gap-2 font-semibold">
              <Check className="h-5 w-5 text-primary" />
              Nahráno {result.created} recenzí
            </p>
            {result.skipped.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Přeskočeno jako duplicita: {result.skipped.join(", ")}
              </p>
            )}
            {result.failed.length > 0 && (
              <p className="text-sm text-amber-700">Nepodařilo se: {result.failed.join(", ")}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Recenze jsou rovnou publikované —{" "}
              <Link href="/recenze" className="text-primary hover:underline">
                podívejte se na web
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
