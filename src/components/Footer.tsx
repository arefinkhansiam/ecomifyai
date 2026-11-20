import { Link } from "@tanstack/react-router";
import { Twitter, Linkedin, Instagram, Facebook, ShieldCheck, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="px-4 pb-12 pt-16 bg-white border-t border-[#E2E8F0] text-[#475569]">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1 & 2: Logo, Socials & Newsletter */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F2744] via-[#1E40AF] to-[#2563EB] grid place-items-center text-white shadow-sm shadow-blue-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7Z" stroke="white" strokeWidth="2"/>
                  <path d="M9 5V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V5" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="13" r="3" fill="#60A5FA"/>
                </svg>
              </div>
              <span className="text-[19px] font-extrabold tracking-tight text-[#0B192C]">
                Easibie<span className="text-[#2563EB]">.ai</span>
              </span>
            </Link>
            <p className="text-[13px] text-[#64748B] mt-3 max-w-sm leading-relaxed">
              The AI-powered Virtual Photo Try-On SaaS platform for fashion e-commerce. Helping retailers reduce returns and elevate customer confidence.
            </p>

            {/* Social Icons in soft blue circles */}
            <div className="flex gap-2 mt-5">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full grid place-items-center bg-[#F1F5F9] text-[#1E40AF] hover:bg-[#2563EB] hover:text-white transition shadow-sm"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>

            {/* Newsletter Section */}
            <div className="mt-7">
              <h4 className="text-[13px] font-bold text-[#0B192C] mb-1">Stay Ahead in Fashion Tech</h4>
              <p className="text-[12px] text-[#64748B] mb-3">
                Monthly retail benchmarks, sizing accuracy reports, and product drops.
              </p>
              <div className="flex gap-2 max-w-xs">
                <input
                  type="email"
                  placeholder="merchant@store.com"
                  className="bg-white border border-[#CBD5E1] text-[#0B192C] text-[12px] px-3.5 py-2 rounded-full flex-1 outline-none focus:border-[#2563EB]"
                />
                <button className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-[12px] font-bold px-4 py-2 rounded-full transition shadow-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Col 3: Product */}
          <div>
            <h4 className="text-[13px] font-bold text-[#0B192C] mb-4">Product</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><a href="#photo-studio" className="hover:text-[#1E40AF] transition">Photo Try-On Studio</a></li>
              <li><a href="#how-it-works" className="hover:text-[#1E40AF] transition">How It Works</a></li>
              <li><a href="#embed-widget" className="hover:text-[#1E40AF] transition">Store Embed Widget</a></li>
              <li><a href="#roadmap" className="hover:text-[#1E40AF] transition">Roadmap & Live AR</a></li>
              <li><a href="#pricing" className="hover:text-[#1E40AF] transition">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Col 4: Platform & Integrations */}
          <div>
            <h4 className="text-[13px] font-bold text-[#0B192C] mb-4">Integrations</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><a href="#integrations" className="hover:text-[#1E40AF] transition">Shopify Plus App</a></li>
              <li><a href="#integrations" className="hover:text-[#1E40AF] transition">WooCommerce Plugin</a></li>
              <li><a href="#integrations" className="hover:text-[#1E40AF] transition">React / Next.js SDK</a></li>
              <li><a href="#integrations" className="hover:text-[#1E40AF] transition">Universal Script Tag</a></li>
              <li><Link to="/dashboard" className="hover:text-[#1E40AF] transition">Merchant Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 5: Trust & Ethics */}
          <div>
            <h4 className="text-[13px] font-bold text-[#0B192C] mb-4">Trust & Legal</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><ShieldCheck size={14} /> Zero Biometric Retention</span></li>
              <li><a href="#privacy" className="hover:text-[#1E40AF] transition">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-[#1E40AF] transition">Terms of Service</a></li>
              <li><a href="#camera-policy" className="hover:text-[#1E40AF] transition">Camera & Photo Ethics</a></li>
              <li><a href="#support" className="hover:text-[#1E40AF] transition">Support & Help Desk</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#64748B] gap-4">
          <div>
            © {new Date().getFullYear()} Easibie Inc. All rights reserved. Built for modern fashion retailers.
          </div>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-[#0B192C] transition">Terms & Condition</a>
            <a href="#privacy" className="hover:text-[#0B192C] transition">Privacy Policy</a>
            <a href="#security" className="hover:text-[#0B192C] transition">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
