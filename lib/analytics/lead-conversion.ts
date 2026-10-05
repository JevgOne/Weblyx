/**
 * One path for every enquiry form: mark the lead, go to /poptavka/dekujeme,
 * and let that page report the conversion once.
 *
 * Each form used to fire its own mix of events — the /poptavka form fired
 * them and then the thank-you page fired them again (GA4 counted every lead
 * twice), while the homepage, landing-page and contact forms never reached the
 * thank-you page at all, so the Google Ads "Submit lead form" conversion, set
 * up as a page load of that URL, could only ever count one form of five.
 */

const FLAG = 'wbx-lead-sent';
export const LOAD_TAGS_EVENT = 'wbx:load-tags';
/** Set before the loader may have mounted (a fresh load of the thank-you page). */
export const LOAD_TAGS_FLAG = '__wbxLoadTags';

/** Called by a form after the server accepted the enquiry. */
export function markLeadSent(source: string): void {
  try {
    sessionStorage.setItem(FLAG, source || 'web');
  } catch {
    /* private mode: the page-load conversion in Google Ads still counts */
  }
  // The submit was an interaction, so the tags are loading already; this
  // covers a keyboard-only submit as well.
  window.dispatchEvent(new Event(LOAD_TAGS_EVENT));
}

/**
 * Called once by the thank-you page. Returns the form id when this visit
 * follows a real submission, null for a refresh or a direct visit.
 */
export function consumeLeadSent(): string | null {
  try {
    const source = sessionStorage.getItem(FLAG);
    if (source) sessionStorage.removeItem(FLAG);
    return source;
  } catch {
    return null;
  }
}

/** The conversion itself, reported in one place. */
export function reportLeadConversion(source: string): void {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
  // The Pixel stub is an afterInteractive script; on a fresh load of the
  // thank-you page this runs first, so wait for it (up to 5 s) rather than
  // drop the Lead event.
  let tries = 0;
  const sendFb = () => {
    if (w.fbq) w.fbq('track', 'Lead');
    else if (++tries < 25) setTimeout(sendFb, 200);
  };
  sendFb();
  w.gtag?.('event', 'generate_lead', { currency: 'CZK', value: 10000, form_id: source });
  // The Google Ads "Contact Us" conversion (Google tag event).
  w.gtag?.('event', 'ads_conversion_Contact_Us_1', {});
}
