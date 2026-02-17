"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ReviewSubmissionFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function ReviewSubmissionForm({ onSuccess, compact = false }: ReviewSubmissionFormProps) {
  const [formData, setFormData] = useState({
    authorName: "",
    authorRole: "",
    rating: 0,
    text: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Nepodařilo se odeslat recenzi");
      }

      setSuccess(true);
      setFormData({
        authorName: "",
        authorRole: "",
        rating: 0,
        text: "",
      });

      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Něco se pokazilo. Zkuste to prosím znovu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800 ml-2">
          <strong>Děkujeme za vaši recenzi!</strong>
          <p className="mt-1 text-sm">
            Vaše recenze byla odeslána a po schválení administrátorem bude zveřejněna na našem webu.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={compact ? "" : "max-w-2xl mx-auto"}>
      <CardHeader>
        <CardTitle>Napište nám recenzi</CardTitle>
        <CardDescription>
          Sdílejte svou zkušenost s našimi službami. Vaše zpětná vazba nám pomáhá se zlepšovat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <Label>Hodnocení *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || formData.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {formData.rating === 5 && "Vynikající! ⭐"}
                {formData.rating === 4 && "Velmi dobré! 👍"}
                {formData.rating === 3 && "Dobré"}
                {formData.rating === 2 && "Průměrné"}
                {formData.rating === 1 && "Potřebuje zlepšení"}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">Vaše jméno *</Label>
            <Input
              id="authorName"
              placeholder="např. Jan Novák"
              value={formData.authorName}
              onChange={(e) =>
                setFormData({ ...formData, authorName: e.target.value })
              }
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          {/* Role (optional) */}
          <div className="space-y-2">
            <Label htmlFor="authorRole">Pozice / Firma (volitelné)</Label>
            <Input
              id="authorRole"
              placeholder="např. CEO, Firma s.r.o."
              value={formData.authorRole}
              onChange={(e) =>
                setFormData({ ...formData, authorRole: e.target.value })
              }
              maxLength={100}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="text">Vaše recenze *</Label>
            <Textarea
              id="text"
              placeholder="Podělte se o svou zkušenost s našimi službami..."
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              required
              minLength={10}
              maxLength={1000}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.text.length} / 1000 znaků
            </p>
          </div>

          {/* Privacy Notice */}
          <Alert>
            <AlertDescription className="text-xs">
              Odesláním recenze souhlasíte se zveřejněním vašeho jména a recenze na našem webu.
              Vaše recenze bude před zveřejněním schválena administrátorem.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || formData.rating === 0}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Odesílám...
              </>
            ) : (
              "Odeslat recenzi"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
