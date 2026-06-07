import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-ink">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
