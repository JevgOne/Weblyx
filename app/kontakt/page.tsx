import type { Metadata } from "next";
import { Contact } from "@/components/home/contact";

export const metadata: Metadata = {
  title: "Kontakt | Weblyx - Napište nám",
  description: "Máte dotaz nebo zájem o spolupráci? Napište nám a my se vám ozveme do 24 hodin.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-16">
      <Contact />
    </main>
  );
}
