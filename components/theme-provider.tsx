"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * `lightOnly` switches dark mode off for good. The Czech site is light by
 * design, but the theme used to follow the visitor's system: `html.dark` was
 * set, and every `dark:` class and hard-coded dark rule fired against a white
 * page — pale text in the blog, a black band over a dark heading on /faq. With
 * the theme forced, `html.dark` never appears and none of that can happen.
 */
export function ThemeProvider({ children, lightOnly = false }: { children: React.ReactNode; lightOnly?: boolean }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={lightOnly ? "light" : "system"}
      enableSystem={!lightOnly}
      forcedTheme={lightOnly ? "light" : undefined}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
