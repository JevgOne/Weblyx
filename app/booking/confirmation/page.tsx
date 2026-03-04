"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "error";
  const bookingId = searchParams.get("bookingId");
  const message = searchParams.get("message");

  const configs: Record<
    string,
    {
      icon: React.ReactNode;
      title: string;
      description: string;
      color: string;
    }
  > = {
    success: {
      icon: <CheckCircle className="h-16 w-16 text-emerald-500" />,
      title: "Platba proběhla úspěšně!",
      description:
        "Vaše rezervace je potvrzena. Na e-mail jsme vám zaslali potvrzení s detaily.",
      color: "text-emerald-600",
    },
    pending: {
      icon: <Clock className="h-16 w-16 text-amber-500" />,
      title: "Čekáme na potvrzení platby",
      description:
        "Platba se zpracovává. Jakmile bude ověřena, dostanete potvrzení na e-mail. Může to trvat několik minut.",
      color: "text-amber-600",
    },
    cancelled: {
      icon: <XCircle className="h-16 w-16 text-red-500" />,
      title: "Platba byla zrušena",
      description:
        "Platba nebyla dokončena. Vaše rezervace je stále aktivní po dobu 24 hodin. Můžete se vrátit a zkusit platbu znovu.",
      color: "text-red-600",
    },
    error: {
      icon: <AlertTriangle className="h-16 w-16 text-red-500" />,
      title: "Nastala chyba",
      description:
        message === "not_found"
          ? "Rezervace nebyla nalezena."
          : message === "missing_booking"
          ? "Chybí identifikátor rezervace."
          : "Při zpracování platby nastala chyba. Kontaktujte nás prosím.",
      color: "text-red-600",
    },
  };

  const config = configs[status] || configs.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">{config.icon}</div>
          <CardTitle className={`text-xl ${config.color}`}>
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{config.description}</p>

          {bookingId && (
            <p className="text-xs text-muted-foreground">
              ID rezervace: <code className="bg-muted px-1 rounded">{bookingId}</code>
            </p>
          )}

          <div className="pt-4">
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/">Zpět na hlavní stránku</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
