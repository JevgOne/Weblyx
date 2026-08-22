export function NovaFooter() {
  return (
    <footer
      className="border-t"
      style={{
        background: "var(--n-ink)",
        color: "var(--n-text-dim)",
        borderColor: "rgba(255,255,255,.1)",
      }}
    >
      {/* No admin link here — the panel is not linked from the public site. */}
      <div className="nova-container flex flex-wrap items-center justify-between gap-4 py-9 text-[13px] font-medium">
        <span className="text-[17px] font-bold text-white">Weblyx</span>
        <span>© 2026 Weblyx · Altro Servis Group s.r.o. · IČO 23673389</span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <a href="/ochrana-udaju" className="hover:text-white">
            Ochrana údajů
          </a>
          <a href="/obchodni-podminky" className="hover:text-white">
            Obchodní podmínky
          </a>
          <a href="/cookies" className="hover:text-white">
            Cookies
          </a>
        </nav>
        <span>Vytvořeno v Česku</span>
      </div>
    </footer>
  );
}
