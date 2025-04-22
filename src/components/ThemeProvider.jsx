"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = React.useState(false)

  // Ensure we only render after hydration to prevent mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same structure to prevent layout shift
    return <div style={{ visibility: "hidden" }}>{children}</div>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
