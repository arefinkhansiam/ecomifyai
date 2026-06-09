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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm">{items.length} products</p>
        <Link to="/dashboard/upload" className="btn-primary text-xs"><Upload size={14} /> New Product</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0,1,2].map(i => <div key={i} className="bg-card rounded-2xl h-64 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center">
          <Box size={48} className="mx-auto text-[var(--lavender)]" />
          <h3 className="text-white mt-4">No try-on products yet</h3>
          <p className="mt-2 text-sm">Upload your first product photo to get started.</p>
          <Link to="/dashboard/upload" className="btn-primary mt-6 inline-flex"><Upload size={14} /> Upload Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} onDelete={() => del(p.id)} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function ProductCard({ p, onDelete }: { p: Product; onDelete: () => void }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const path = p.processed_image_url ?? p.original_image_url;
    if (!path) return;
    supabase.storage.from("product-images").createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setThumb(data.signedUrl);
    });
  }, [p.processed_image_url, p.original_image_url]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const viewerUrl = `${origin}/ar/view/${p.id}`;
  const embedCode = `<iframe src="${viewerUrl}" width="100%" height="550" frameborder="0" allow="xr-spatial-tracking; camera" allowfullscreen></iframe>`;

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <div className="aspect-square relative grid place-items-center" style={{ background: `radial-gradient(ellipse at center, ${p.dominant_color}33, transparent 70%)` }}>
        {thumb ? <img src={thumb} alt={p.product_name} className="max-h-full max-w-full object-contain" /> : <Box size={56} className="text-[var(--lavender)]" />}
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
          style={{
            background: p.status === "ready" ? "rgba(16,185,129,0.15)" : p.status === "failed" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
            color: p.status === "ready" ? "var(--success)" : p.status === "failed" ? "var(--error)" : "var(--warning)",
          }}>{p.status === "ready" ? "Try-On Ready" : p.status}</span>
      </div>
      {p.status === "processing" && (
        <div className="h-1 bg-[var(--surface)]"><div className="h-full bg-[var(--primary)]" style={{ width: `${p.processing_progress}%` }} /></div>
      )}
      <div className="p-4">
        <h4 className="text-white truncate">{p.product_name}</h4>
        <div className="text-xs text-muted mt-1">{(p.view_count ?? p.views_count ?? 0).toLocaleString()} views</div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {p.status === "ready" && (
            <a href={viewerUrl} target="_blank" rel="noreferrer" className="flex-1 btn-ghost text-[10px]"><ExternalLink size={12} /> Preview Try-On</a>
          )}
          {p.status === "ready" && (
            <button onClick={copyEmbed} className="btn-ghost text-[10px]">
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Embed"}
            </button>
          )}
          <Link to="/dashboard/products/$id/customize" params={{ id: p.id }} className="btn-ghost text-[10px]" title="Customize">
            <Settings2 size={12} /> Edit
          </Link>
          <Link to="/dashboard/embed" search={{ product: p.id }} className="btn-ghost text-[10px]"><QrCode size={12} /></Link>
          <button onClick={onDelete} className="btn-ghost text-[10px]" style={{ borderColor: "var(--error)", color: "var(--error)" }}><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}
