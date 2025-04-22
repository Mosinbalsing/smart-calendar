import React from "react";
import { ThemeProvider } from "../components/ThemeProvider";

// Optional: If you're not using Google Fonts through Next.js,
// add the font via index.html or import via CSS instead

export default function Layout({ children }) {
  return (
    <div lang="en">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </div>
  );
}
