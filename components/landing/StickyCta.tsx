"use client";

/**
 * The phone number and the form, always within reach on a phone.
 *
 * On a landing page the visitor arrives at the top and the form is somewhere
 * below the fold; on a small screen that is several thumb-flicks away. This bar
 * keeps both one tap away without the visitor having to find their way back.
 *
 * Desktop hides it — there the form is usually already on screen, and a fixed
 * bar would only eat space.
 */
export function StickyCta({ formId = "poptavka" }: { formId?: string }) {
  const call = () => {
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    gtag?.("event", "click_to_call", { phone: "+420702110166" });
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 p-3 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="tel:+420702110166"
        onClick={call}
        className="flex flex-1 items-center justify-center rounded-md border px-4 py-3 text-sm font-semibold"
      >
        Zavolat
      </a>
      <a
        href={`#${formId}`}
        className="flex flex-[1.4] items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
      >
        Chci nabídku
      </a>
    </div>
  );
}
