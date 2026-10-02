/**
 * The enquiry forms store machine values ("new-web", "asap", "partial"). The
 * panel printed them as they were; this is the one place they get words.
 */
const VALUE_LABELS: Record<string, string> = {
  // project type
  "new-web": "Nový web",
  landing: "Landing page",
  redesign: "Redesign",
  "web-app": "Webová aplikace",
  eshop: "E-shop",
  audit: "Audit webu",
  other: "Jiné",
  // source
  contact_form: "Kontaktní formulář",
  questionnaire: "Dotazník",
  // timeline
  asap: "Co nejdříve",
  flexible: "Nespěchá",
  // budget
  "10-30k": "10–30 tis. Kč",
  "30-60k": "30–60 tis. Kč",
  // purpose, content, style
  booking: "Rezervace",
  yes: "Ano",
  partial: "Částečně",
  no: "Ne",
  "modern-minimal": "Moderní a minimalistický",
};

/** Unknown values pass through — free text and newer form options stay readable. */
export const leadValueLabel = (value: string) => VALUE_LABELS[value] ?? value;
