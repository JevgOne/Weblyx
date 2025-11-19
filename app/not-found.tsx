import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold">
          Stránka nenalezena
        </h2>
        <p className="text-muted-foreground">
          Omlouváme se, ale stránka, kterou hledáte, neexistuje.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Zpět domů
          </Link>
          <Link
            href="/kontakt"
            className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Kontaktujte nás
          </Link>
        </div>
      </div>
    </div>
  );
}
