import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Skyrim Tools",
  description: "Fast reference tools for Skyrim — alchemy, trainers, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <header className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between shrink-0">
            <a href="/skyrim" className="text-[var(--accent)] font-semibold tracking-wide text-sm uppercase">
              Skyrim Tools
            </a>
            <nav className="flex gap-4 text-sm text-[var(--text-muted)]">
              <a href="/skyrim/alchemy" className="hover:text-[var(--text)] transition-colors">Alchemy</a>
            </nav>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-faint)] text-center">
            Ingredient location data sourced from{" "}
            <a
              href="https://en.uesp.net"
              className="underline hover:text-[var(--text-muted)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              UESP
            </a>{" "}
            (CC-BY-SA). Not affiliated with Bethesda.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
