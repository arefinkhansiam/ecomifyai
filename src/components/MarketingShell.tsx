import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Navbar />
      <main className="pt-16 md:pt-[72px]">{children}</main>
      <Footer />
    </div>
  );
}
