import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: [
      { to: "/how-it-works", label: "Features" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/about", label: "Blog" },
      { to: "/about", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/how-it-works", label: "Help Center" },
      { to: "/how-it-works", label: "Getting Started" },
      { to: "/how-it-works", label: "Embed Guide" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#07070C", borderTop: "1px solid var(--border)" }} className="pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="font-display text-[22px] font-extrabold">
            <span className="text-cyan">E</span><span className="text-white">ASIBIE</span>
          </Link>
          <p className="mt-3 text-sm">The future of e-commerce is spatial.</p>
          <div className="flex gap-2 mt-5">
            {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-card grid place-items-center hover:bg-[var(--primary)] transition-colors">
                <Icon size={16} className="text-white" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-[13px] uppercase tracking-[2px] text-muted mb-4">{c.title}</h4>
            <ul className="space-y-3">
              {c.links.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-sm text-muted hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-6 mt-14 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row justify-between gap-3 text-[13px] text-muted">
        <div>2025 Ecomify. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
