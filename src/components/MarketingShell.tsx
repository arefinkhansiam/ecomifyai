import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AiChatbot } from "./AiChatbot";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-ink">
      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
      <AiChatbot />
    </div>
  );
}
