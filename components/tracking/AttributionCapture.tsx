"use client";

import { useEffect } from "react";
import { captureAttribution } from "./AttributionFields";

/**
 * Records where the visit came from, on arrival at any page.
 *
 * Capturing at submit time only was not enough: someone who clicks an ad onto
 * one page and sends the form from another arrives at the form with a clean
 * URL, and the campaign that paid for the click is lost. Mounted once in the
 * root layout, this stores the first touch on whatever page it happens on.
 *
 * Renders nothing and reads only the URL already in the address bar, so it
 * costs a single effect and no layout.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
