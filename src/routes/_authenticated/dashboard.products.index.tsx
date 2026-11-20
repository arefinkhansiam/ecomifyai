import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import {
  Box,
  ExternalLink,
  Trash2,
  Upload,
  Copy,
  Check,
  Settings2,
  Share2,
  Download,
  Link2,
  QrCode,
  Code2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import demoAfter from "@/assets/demo-after.jpg";

type Product = {
  id: string;
  product_name: string;
  status: string;
  dominant_color: string;
  views_count: number;
  processing_progress: number;
  processed_image_url: string | null;
  original_image_url: string | null;
  created_at: string;
  embed_token: string | null;
  view_count?: number;
};

export const Route = createFileRoute("/_authenticated/dashboard/products/")({
  component: ProductsPage,
});

const DEFAULT_DEMO_PRODUCTS: Product[] = [
  {
    id: "eb-blz-01",
    product_name: "Obsidian Tailored Double-Breasted Blazer",
    status: "ready",
    dominant_color: "#0F172A",
    views_count: 4820,
    processing_progress: 100,
    processed_image_url: null,
    original_image_url: null,
    created_at: new Date().toISOString(),
    embed_token: "tok_blz_01",
  },
  {
    id: "eb-lin-04",
    product_name: "Sage Belgian Relaxed Linen Shirt",
    status: "ready",
    dominant_color: "#84A98C",
    views_count: 3610,
    processing_progress: 100,
    processed_image_url: null,
    original_image_url: null,
    created_at: new Date().toISOString(),
    embed_token: "tok_lin_04",
  },
  {
    id: "eb-drs-08",
    product_name: "Mulberry Silk Charmeuse Evening Slip Dress",
    status: "ready",
    dominant_color: "#581C87",
    views_count: 2940,
    processing_progress: 100,
    processed_image_url: null,
    original_image_url: null,
    created_at: new Date().toISOString(),
    embed_token: "tok_drs_08",
  },
  {
    id: "eb-dnm-02",
    product_name: "Raw Selvedge 14oz Trucker Jacket",
    status: "ready",
    dominant_color: "#172554",
    views_count: 2150,
    processing_progress: 100,
    processed_image_url: null,
    original_image_url: null,
    created_at: new Date().toISOString(),
    embed_token: "tok_dnm_02",
  },
];

function ProductsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) {
      setItems(DEFAULT_DEMO_PRODUCTS);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("ar_products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as Product[];
    setItems(rows.length > 0 ? rows : DEFAULT_DEMO_PRODUCTS);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`ar_products:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ar_products", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const del = async (id: string) => {
    if (!confirm("Remove this try-on product from catalog?")) return;
    if (user) {
      await supabase.from("ar_products").delete().eq("id", id);
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product removed from catalog");
  };

  return (
    <DashboardShell title="Store Apparel Products">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#0B192C] tracking-tight">
            Store Apparel Catalog
          </h1>
          <p className="text-[13px] text-[#64748B] mt-1">
            Manage your fashion garments, grab embed snippets, and preview photo try-ons.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            to="/dashboard/embed"
            className="btn-white-secondary text-[12.5px] !py-2 !px-4"
          >
            <Code2 size={14} className="text-blue-600" /> Embed Widget
          </Link>
          <Link
            to="/dashboard/upload"
            className="btn-blue-primary text-[12.5px] !py-2 !px-4"
          >
            <Upload size={14} /> Add New SKU
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((p) => (
          <div
            key={p.id}
            className="card-white overflow-hidden flex flex-col justify-between group hover:border-blue-300 transition"
          >
            <div>
              {/* Product Image Canvas */}
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                <img
                  src={demoAfter}
                  alt={p.product_name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Photo Try-On Active
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="text-[14px] font-bold text-[#0B192C] line-clamp-1">
                  {p.product_name}
                </h4>
                <div className="flex items-center justify-between mt-1 text-[11.5px] text-[#64748B]">
                  <span>{(p.view_count ?? p.views_count ?? 1200).toLocaleString()} shopper try-ons</span>
                  <span className="font-semibold text-blue-700">98.8% Fit Score</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 space-y-2">
              <Link
                to="/dashboard/embed"
                search={{ product: p.id }}
                className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Code2 size={13} /> Get Embed Code
              </Link>
              <div className="flex gap-2">
                <Link
                  to="/try-ar"
                  target="_blank"
                  className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-[#0B192C] flex items-center justify-center gap-1 transition"
                >
                  <ExternalLink size={12} /> Test Fitting
                </Link>
                <button
                  onClick={() => del(p.id)}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition"
                  title="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
