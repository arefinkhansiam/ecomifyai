import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AiChatbot } from "./AiChatbot";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#0B192C]">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
      <AiChatbot />
    </div>
  );
}
