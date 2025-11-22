import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  const footerLinks = {
    company: [
      { name: "O nás", href: "/o-nas" },
      { name: "Služby", href: "/sluzby" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Blog", href: "/blog" },
      { name: "Kontakt", href: "/kontakt" },
    ],
    services: [
      { name: "Webové stránky", href: "/sluzby#web" },
      { name: "E-shopy", href: "/sluzby#eshop" },
      { name: "SEO optimalizace", href: "/sluzby#seo" },
      { name: "Redesign", href: "/sluzby#redesign" },
      { name: "Údržba", href: "/sluzby#maintenance" },
    ],
    legal: [
      { name: "Ochrana osobních údajů", href: "/ochrana-udaju" },
      { name: "Obchodní podmínky", href: "/obchodni-podminky" },
    ],
  };


  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-xl">W</span>
              </div>
              <span className="font-bold text-xl">Weblyx</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Moderní webová agentura zaměřená na tvorbu kvalitních webových stránek za
              konkurenceschopné ceny.
            </p>
            {/* Social Media Links */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com/weblyx.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/weblyx.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/420702110166"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Společnost</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Služby</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kontakt</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:weblyxinfo@gmail.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  weblyxinfo@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+420702110166"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +420 702 110 166
                </a>
              </li>
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Weblyx. Všechna práva vyhrazena.
          </p>
          <p className="text-sm text-muted-foreground">
            Vytvořeno s ❤️ a ☕️ v Česku
          </p>
        </div>
      </div>
    </footer>
  );
}
