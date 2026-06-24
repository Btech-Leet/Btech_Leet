"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Encountered a script tag while rendering React component") ||
       args[0].includes("A tree hydrated but some attributes of the server rendered HTML didn't match") ||
       args[0].includes("fdprocessedid") ||
       args[0].includes("data-new-gr-c-s-check-loaded") ||
       args[0].includes("data-gr-ext-installed") ||
       args[0].includes("data-gramm") ||
       args[0].includes("data-gramm_editor") ||
       args[0].includes("data-gramm_id") ||
       args[0].includes("cz-shortcut-listen") ||
       args[0].includes("suppressHydrationWarning"))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
