import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AiChatbot } from "./AiChatbot";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AiChatbot />
    </div>
  );
}
