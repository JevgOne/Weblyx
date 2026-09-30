"use client";

import { useEffect, useState } from "react";

/**
 * Carries where the visitor came from into the enquiry.
 *
 * Nothing on the site captured utm or gclid, so every lead arrived with no way
 * to tell which campaign paid for it. These fields close that gap.
 *
 * First-touch, not last: the campaign that brought someone to the site is the
 * one that earned the lead, even if they read three more pages before filling
 * anything in. The values are stashed in sessionStorage on the first page that
 * carries them and reused afterwards, so browsing does not erase the source.
 *
 * Storage can throw outright (private windows, blocked site data), so every
 * read and write is guarded and the form still submits with empty attribution
 * rather than failing.
 */
const STORAGE_KEY = "wbx_attribution";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  landing_page?: string;
  referrer?: string;
}

function readStored(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function store(value: Attribution): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* Private window or blocked storage — the current page still submits. */
  }
}

/** Reads the current URL. Exported so the form can use it without the markup. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  const stored = readStored();
  // A campaign already recorded this session wins: it was the first touch.
  if (stored && (stored.gclid || stored.utm_source)) return stored;

  const params = new URLSearchParams(window.location.search);
  const fresh: Attribution = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) fresh[key] = value.slice(0, 200);
  }

  const gclid = params.get("gclid");
  if (gclid) fresh.gclid = gclid.slice(0, 200);

  fresh.landing_page = window.location.pathname.slice(0, 200);

  // Our own pages are not a referrer worth recording.
  try {
    const ref = document.referrer;
    if (ref && new URL(ref).hostname !== window.location.hostname) {
      fresh.referrer = ref.slice(0, 300);
    }
  } catch {
    /* Malformed or empty referrer. */
  }

  // Only worth keeping if it says something a later page would not.
  if (fresh.gclid || fresh.utm_source || !stored) store(fresh);
  return fresh;
}

/** Hidden inputs, for forms that post the whole form element. */
export function AttributionFields() {
  const [data, setData] = useState<Attribution>({});

  // After mount: the URL is not known during prerendering, and reading it
  // during render would make the page dynamic.
  useEffect(() => setData(captureAttribution()), []);

  return (
    <>
      {Object.entries(data).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value ?? ""} readOnly />
      ))}
    </>
  );
}
