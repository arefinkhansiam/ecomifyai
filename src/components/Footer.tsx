import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";
import paymentMethods from "@/assets/payment-methods.png.asset.json";

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
    <footer
      className="pt-20 pb-10"
      style={{
        background: "linear-gradient(180deg, #0B1220 0%, #07070C 60%, #020205 100%)",
        borderTop: "1px solid rgba(56,189,248,0.12)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="font-display text-[22px] font-extrabold">
            <span className="text-cyan">E</span><span className="text-white">COMIFY</span>
          </Link>
          <p className="mt-3 text-sm text-white/60">AI try-on for modern commerce.</p>
          <div className="flex gap-2 mt-5">
            {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full grid place-items-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              >
                <Icon size={16} className="text-white" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-[13px] uppercase tracking-[2px] text-white/40 mb-4">{c.title}</h4>
            <ul className="space-y-3">
              {c.links.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div className="mx-auto max-w-7xl px-6 mt-14">
        <div className="text-center text-[12px] uppercase tracking-[0.2em] text-white/50 mb-4">We Accept</div>
        <div className="flex justify-center">
          <img
            src={paymentMethods.url}
            alt="Accepted payment methods: Mastercard, Visa, American Express, Discover, PayPal, Amazon Pay, 2Checkout"
            className="max-w-full h-auto rounded-md bg-white px-4 py-3"
            style={{ maxHeight: 72 }}
          />
        </div>
      </div>

      <div
        className="mx-auto max-w-7xl px-6 mt-8 pt-6 flex flex-col md:flex-row justify-between gap-3 text-[13px]"
        style={{ color: "rgba(255,255,255,0.35)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div>2025 Ecomify. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

