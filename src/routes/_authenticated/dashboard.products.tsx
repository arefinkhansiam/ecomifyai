import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Box, ExternalLink, Trash2, QrCode, Upload, Copy, Check, Settings2 } from "lucide-react";

type Product = {
  id: string; product_name: string; status: string; dominant_color: string;
  views_count: number; processing_progress: number; processed_image_url: string | null;
  original_image_url: string | null; created_at: string;
  embed_token: string | null; view_count?: number;
};

export const Route = createFileRoute("/_authenticated/dashboard/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("ar_products").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems((data ?? []) as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`ar_products:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ar_products", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const del = async (id: string) => {
    if (!confirm("Delete this try-on product?")) return;
    await supabase.from("ar_products").delete().eq("id", id);
    toast.success("Deleted");
  };

  return (
    <DashboardShell title="My Try-Ons">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Catalog</p>
          <h3 className="text-ink m-0 text-lg">{items.length} products</h3>
        </div>
        <Link to="/dashboard/upload" className="btn-primary text-xs"><Upload size={14} /> New Product</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => <div key={i} className="bg-card rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl p-10 text-center">
          <Box size={40} className="mx-auto text-[var(--lavender)]" />
          <h4 className="text-ink mt-3">No try-on products yet</h4>
          <p className="mt-1 text-sm">Upload your first product photo to get started.</p>
          <Link to="/dashboard/upload" className="btn-primary mt-5 inline-flex"><Upload size={14} /> Upload Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} onDelete={() => del(p.id)} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function slugify(s: string) {
  return (s || "item").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "item";
}

function ProductCard({ p, onDelete }: { p: Product; onDelete: () => void }) {
  const { user } = useAuth();
  const [thumb, setThumb] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string>("store");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const path = p.processed_image_url ?? p.original_image_url;
    if (path) {
      supabase.storage.from("product-images").createSignedUrl(path, 3600).then(({ data }) => {
        if (data?.signedUrl) setThumb(data.signedUrl);
      });
    }
    if (user) {
      supabase.from("profiles").select("business_name, store_name, full_name").eq("id", user.id).maybeSingle().then(({ data }: any) => {
        const name = data?.business_name || data?.store_name || data?.full_name;
        if (name) setStoreSlug(slugify(name));
      });
    }
  }, [p.processed_image_url, p.original_image_url, user]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const productSlug = `${slugify(p.product_name)}-${p.id.slice(0, 8)}`;
  const viewerUrl = `${origin}/ar/${storeSlug}/${productSlug}`;
  const embedCode = `<iframe src="${viewerUrl}" width="100%" height="550" frameborder="0" allow="xr-spatial-tracking; camera" allowfullscreen></iframe>`;

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl overflow-hidden group transition-transform hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(2,132,199,0.14)", boxShadow: "0 8px 24px -16px rgba(2,132,199,0.4)" }}>
      <div className="aspect-square relative grid place-items-center" style={{ background: `radial-gradient(ellipse at center, ${p.dominant_color}22, transparent 70%)` }}>
        {thumb ? <img src={thumb} alt={p.product_name} className="max-h-full max-w-full object-contain p-3" /> : <Box size={36} className="text-[var(--lavender)]" />}
        <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold"
          style={{
            background: p.status === "ready" ? "rgba(16,185,129,0.18)" : p.status === "failed" ? "rgba(239,68,68,0.18)" : "rgba(245,158,11,0.18)",
            color: p.status === "ready" ? "var(--success)" : p.status === "failed" ? "var(--error)" : "var(--warning)",
          }}>{p.status === "ready" ? "Ready" : p.status}</span>
      </div>
      {p.status === "processing" && (
        <div className="h-0.5 bg-[var(--surface)]"><div className="h-full bg-[var(--primary)]" style={{ width: `${p.processing_progress}%` }} /></div>
      )}
      <div className="p-3">
        <h5 className="text-ink truncate text-sm font-semibold m-0">{p.product_name}</h5>
        <div className="text-[10px] text-muted mt-0.5">{(p.view_count ?? p.views_count ?? 0).toLocaleString()} views</div>
        {p.status === "ready" && (
          <a href={viewerUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-1 w-full px-2 py-1.5 rounded-lg text-[10px] font-semibold text-white" style={{ background: "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)" }}>
            <ExternalLink size={11} /> Preview Try-On
          </a>
        )}
        <div className="flex gap-1 mt-1.5">
          <Link to="/dashboard/products/$id/customize" params={{ id: p.id }} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold" style={{ border: "1px solid rgba(2,132,199,0.25)", color: "var(--ink)" }}>
            <Settings2 size={11} /> Edit
          </Link>
          {p.status === "ready" && (
            <button onClick={copyEmbed} className="inline-flex items-center justify-center w-8 h-8 rounded-lg" style={{ border: "1px solid rgba(2,132,199,0.2)", color: "var(--ink-soft)" }} title="Embed">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
          <button onClick={onDelete} className="inline-flex items-center justify-center w-8 h-8 rounded-lg" style={{ border: "1px solid rgba(239,68,68,0.35)", color: "#EF4444" }} title="Delete"><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}


