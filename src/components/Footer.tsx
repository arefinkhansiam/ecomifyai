import { Link } from "@tanstack/react-router";
import { Twitter, Linkedin, Instagram, Facebook, ShieldCheck } from "lucide-react";
import { EasibieLogo } from "./EasibieLogo";

export function Footer() {
  return (
    <footer className="px-4 pb-12 pt-16 bg-white border-t border-[#E2E8F0] text-[#475569]">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1 & 2: Logo, Socials & Newsletter */}
          <div className="md:col-span-2">
            <EasibieLogo size="md" showSubtitle />
            <p className="text-[13px] text-[#64748B] mt-3 max-w-sm leading-relaxed">
              Virtual try-on software for fashion e-commerce. Helping retailers reduce sizing-related returns and increase shopper checkout confidence.
            </p>

            <div className="flex gap-2 mt-5">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg grid place-items-center bg-[#F1F5F9] text-[#1E40AF] hover:bg-[#1E40AF] hover:text-white transition shadow-2xs"
                  aria-label="Social link"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-7">
              <h4 className="text-[13px] font-bold text-[#0F172A] mb-1">E-Commerce Insights</h4>
              <p className="text-[12px] text-[#64748B] mb-2.5">
                Monthly sizing benchmarks and product release notes.
              </p>
              <div className="flex gap-2 max-w-xs">
                <input
                  type="email"
                  placeholder="merchant@store.com"
                  className="bg-white border border-[#CBD5E1] text-[#0F172A] text-[12px] px-3 py-1.5 rounded-lg flex-1 outline-none focus:border-[#1E40AF]"
                />
                <button className="btn-blue-primary text-[12px] !py-1.5 !px-3 font-semibold whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Col 3: Dedicated Pages */}
          <div>
            <h4 className="text-[13px] font-bold text-[#0F172A] mb-3">Product</h4>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/how-it-works" className="hover:text-[#1E40AF] transition">How It Works</Link></li>
              <li><Link to="/try-ar" className="hover:text-[#1E40AF] transition">Photo Studio</Link></li>
              <li><Link to="/for-stores" className="hover:text-[#1E40AF] transition">For Stores & Embed</Link></li>
              <li><Link to="/roadmap" className="hover:text-[#1E40AF] transition">Roadmap (v2.0)</Link></li>
              <li><Link to="/pricing" className="hover:text-[#1E40AF] transition">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform & Integrations */}
          <div>
            <h4 className="text-[13px] font-bold text-[#0F172A] mb-3">Integrations</h4>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/for-stores" className="hover:text-[#1E40AF] transition">Shopify Plus App</Link></li>
              <li><Link to="/for-stores" className="hover:text-[#1E40AF] transition">WooCommerce Plugin</Link></li>
              <li><Link to="/for-stores" className="hover:text-[#1E40AF] transition">React / Next.js SDK</Link></li>
              <li><Link to="/for-stores" className="hover:text-[#1E40AF] transition">Universal Script Tag</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#1E40AF] transition">Merchant Console</Link></li>
            </ul>
          </div>

          {/* Col 5: Company & Privacy */}
          <div>
            <h4 className="text-[13px] font-bold text-[#0F172A] mb-3">Company</h4>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/about" className="hover:text-[#1E40AF] transition">About Us</Link></li>
              <li><span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[12.5px]"><ShieldCheck size={14} /> Zero Biometric Storage</span></li>
              <li><Link to="/about" className="hover:text-[#1E40AF] transition">Privacy & Ethics</Link></li>
              <li><Link to="/auth" search={{ mode: "signup" }} className="hover:text-[#1E40AF] transition">Merchant Sign Up</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#64748B] gap-4">
          <div>
            © {new Date().getFullYear()} Easibie Inc. All rights reserved.
          </div>
          <div className="flex gap-5">
            <Link to="/about" className="hover:text-[#0F172A] transition">Privacy Policy</Link>
            <Link to="/about" className="hover:text-[#0F172A] transition">Terms of Service</Link>
            <Link to="/about" className="hover:text-[#0F172A] transition">Responsible AI</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
