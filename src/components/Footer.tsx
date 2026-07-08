import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

const cols = [
  { title: "Product", links: [
      { to: "/how-it-works", label: "Features" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/pricing", label: "Pricing" },
  ]},
  { title: "Company", links: [
      { to: "/about", label: "About Us" },
      { to: "/about", label: "Blog" },
      { to: "/about", label: "Contact" },
  ]},
  { title: "Support", links: [
      { to: "/how-it-works", label: "Help Center" },
      { to: "/how-it-works", label: "Getting Started" },
      { to: "/how-it-works", label: "Embed Guide" },
  ]},
];

export function Footer() {
  return (
    <footer className="px-4 pb-6 pt-16 bg-[#F3F4F6]">
      <div className="mx-auto max-w-6xl rounded-[24px] bg-white border border-[#EEF0F3] px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="font-black italic text-[22px] text-ink">Easibie</Link>
            <p className="mt-3 text-[13px] text-[#6B7280]">AI try-on for modern commerce.</p>
            <div className="flex gap-2 mt-5">
              {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full grid place-items-center border border-[#E5E7EB] text-[#6B7280] hover:text-[#2563EB] hover:border-[#2563EB] transition">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-[13px] font-bold text-ink mb-4">{c.title}</h4>
              <ul className="space-y-3">
                {c.links.map((l, i) => (
                  <li key={i}><Link to={l.to} className="text-[13px] text-[#6B7280] hover:text-ink transition">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-[#EEF0F3] flex flex-col md:flex-row justify-between gap-3 text-[12px] text-[#9CA3AF]">
          <div>© 2025 Easibie. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink transition">Privacy Policy</a>
            <a href="#" className="hover:text-ink transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
