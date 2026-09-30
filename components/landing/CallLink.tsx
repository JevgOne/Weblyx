"use client";

/**
 * A phone number that reports being tapped.
 *
 * `click_to_call` did not exist anywhere on the site, so a call started from
 * the web was indistinguishable from one that came from a business card.
 */
export function CallLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href="tel:+420702110166"
      className={className}
      onClick={() => {
        const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
        gtag?.("event", "click_to_call", { phone: "+420702110166" });
      }}
    >
      {children ?? "+420 702 110 166"}
    </a>
  );
}
