import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

const cols = [
  { title: "Product", links: [
      { to: "/how-it-works", label: "Features" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/pricing", label: "Pricing" },
  ]},
  { title: "Company", links: [
      { to: "/about", label: "About" },
      { to: "/about", label: "Blog" },
      { to: "/about", label: "Contact" },
  ]},
  { title: "Support", links: [
      { to: "/how-it-works", label: "Help center" },
      { to: "/how-it-works", label: "Getting started" },
      { to: "/how-it-works", label: "Embed guide" },
  ]},
];

export function Footer() {
  return (
    <footer className="px-4 pb-6 pt-20 bg-[#EDEAFB]">
      <div className="mx-auto max-w-6xl rounded-[28px] bg-white border border-[#E4DEF7] px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-[10px] grid place-items-center bg-[#1F1747] text-white text-[13px] font-black">E</span>
              <span className="text-[18px] font-extrabold tracking-tight text-ink">Easibie</span>
            </Link>
            <p className="mt-4 text-[13px] text-[#6B6689] max-w-[220px]">AI try-on for modern commerce. Turn every product photo into a personalised experience.</p>
            <div className="flex gap-2 mt-5">
              {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full grid place-items-center border border-[#E4DEF7] text-[#6B6689] hover:text-[#1F1747] hover:border-[#1F1747] transition">
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
                  <li key={i}><Link to={l.to} className="text-[13px] text-[#6B6689] hover:text-ink transition">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-[#E4DEF7] flex flex-col md:flex-row justify-between gap-3 text-[12px] text-[#8A83AB]">
          <div>© 2026 Easibie. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink transition">Privacy Policy</a>
            <a href="#" className="hover:text-ink transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
