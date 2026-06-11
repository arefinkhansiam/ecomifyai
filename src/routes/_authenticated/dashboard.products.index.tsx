import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Box, ExternalLink, Trash2, Upload, Copy, Check, Settings2, Share2, Download, Link2, QrCode, Code2, ShoppingBag, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Product = {
  id: string; product_name: string; status: string; dominant_color: string;
  views_count: number; processing_progress: number; processed_image_url: string | null;
  original_image_url: string | null; created_at: string;
  embed_token: string | null; view_count?: number;
};

export const Route = createFileRoute("/_authenticated/dashboard/products/")({
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
        <Link to="/dashboard/upload" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold text-white" style={{ background: "linear-gradient(135deg,#0369A1,#0EA5E9 60%,#38BDF8)" }}><Upload size={14} /> New Product</Link>
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
  const productSlug = `${slugify(p.product_name)}-${p.id}`;
  const viewerUrl = `${origin}/ar/${storeSlug}/${productSlug}`;

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
        <div className="h-0.5 bg-[var(--surface)]"><div className="h-full" style={{ width: `${p.processing_progress}%`, background: "linear-gradient(90deg,#0369A1,#38BDF8)" }} /></div>
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
            <ShareDialog product={p} viewerUrl={viewerUrl} />
          )}
          <button onClick={onDelete} className="inline-flex items-center justify-center w-8 h-8 rounded-lg" style={{ border: "1px solid rgba(239,68,68,0.35)", color: "#EF4444" }} title="Delete"><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}

function ShareDialog({ product, viewerUrl }: { product: Product; viewerUrl: string }) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(viewerUrl, { width: 480, margin: 1, color: { dark: "#0B1220", light: "#FFFFFF" } }).then(setQr);
  }, [open, viewerUrl]);

  const snippets = useMemo(() => {
    const universal = `<!-- Ecomify Try-On — works on ANY website -->
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js" data-product-id="${product.id}" async></script>`;
    const shopify = `{% comment %} Ecomify Try-On — paste in sections/main-product.liquid {% endcomment %}
<div class="ecomify-tryon" data-product-handle="{{ product.handle }}">
  <script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js"
          data-product-id="${product.id}"
          data-shopify-product="{{ product.id }}" async></script>
</div>`;
    const iframe = `<iframe src="${viewerUrl}" width="100%" height="640" style="border:0;border-radius:16px" allow="xr-spatial-tracking; camera; gyroscope; accelerometer" allowfullscreen></iframe>`;
    const wordpress = `<!-- WordPress / Wix / Squarespace / Webflow — paste in a Custom HTML / Code block -->
${universal}`;
    return { universal, shopify, iframe, wordpress };
  }, [product.id, viewerUrl]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg" style={{ border: "1px solid rgba(2,132,199,0.25)", color: "var(--ink-soft)" }} title="Share & embed">
          <Share2 size={12} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={18} style={{ color: "#0EA5E9" }} /> Share &amp; Embed — {product.product_name}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="link" className="mt-2">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="link" className="text-[11px]"><Link2 size={12} className="mr-1" /> Link</TabsTrigger>
            <TabsTrigger value="qr" className="text-[11px]"><QrCode size={12} className="mr-1" /> QR</TabsTrigger>
            <TabsTrigger value="website" className="text-[11px]"><Globe size={12} className="mr-1" /> Website</TabsTrigger>
            <TabsTrigger value="shopify" className="text-[11px]"><ShoppingBag size={12} className="mr-1" /> Shopify</TabsTrigger>
            <TabsTrigger value="iframe" className="text-[11px]"><Code2 size={12} className="mr-1" /> Iframe</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4 space-y-3">
            <p className="text-xs text-muted">Send this link via WhatsApp, email, social, anywhere. Opens your branded AR try-on.</p>
            <SnippetBox value={viewerUrl} onCopy={() => copy(viewerUrl, "Link")} />
            <div className="grid grid-cols-3 gap-2">
              <a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Try it on: ${viewerUrl}`)}`} className="text-[11px] text-center py-2 rounded-lg font-semibold text-white" style={{ background: "#25D366" }}>WhatsApp</a>
              <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(viewerUrl)}`} className="text-[11px] text-center py-2 rounded-lg font-semibold text-white" style={{ background: "#0F172A" }}>X / Twitter</a>
              <a target="_blank" rel="noreferrer" href={`mailto:?subject=Try%20it%20on&body=${encodeURIComponent(viewerUrl)}`} className="text-[11px] text-center py-2 rounded-lg font-semibold" style={{ background: "#F1F5F9", color: "#0F172A" }}>Email</a>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="mt-4 text-center">
            <p className="text-xs text-muted mb-3">Print on packaging, hangtags, or in-store displays.</p>
            {qr ? (
              <>
                <img src={qr} alt="QR" className="w-56 h-56 mx-auto rounded-xl border" style={{ borderColor: "rgba(2,132,199,0.2)" }} />
                <a href={qr} download={`tryon-${slugify(product.product_name)}.png`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}>
                  <Download size={12} /> Download PNG
                </a>
              </>
            ) : <div className="w-56 h-56 mx-auto rounded-xl bg-slate-100 animate-pulse" />}
          </TabsContent>

          <TabsContent value="website" className="mt-4 space-y-3">
            <p className="text-xs text-muted">Works on <b>any</b> website — WordPress, Wix, Squarespace, Webflow, custom HTML. Paste in any code block.</p>
            <SnippetBox multiline value={snippets.universal} onCopy={() => copy(snippets.universal, "Website snippet")} />
            <div className="text-[11px] text-muted">Auto-renders a branded "Try it on" button with your colors. No setup needed.</div>
          </TabsContent>

          <TabsContent value="shopify" className="mt-4 space-y-3">
            <p className="text-xs text-muted">Paste into <code className="text-[10px] bg-slate-100 px-1 rounded">sections/main-product.liquid</code> or any Shopify section.</p>
            <SnippetBox multiline value={snippets.shopify} onCopy={() => copy(snippets.shopify, "Shopify Liquid")} />
            <div className="rounded-lg p-3 text-[11px]" style={{ background: "#ECFEFF", border: "1px solid #A5F3FC", color: "#155E75" }}>
              Tip: place inside your product form so the button appears next to "Add to cart".
            </div>
          </TabsContent>

          <TabsContent value="iframe" className="mt-4 space-y-3">
            <p className="text-xs text-muted">Embed the full try-on viewer directly inside your page.</p>
            <SnippetBox multiline value={snippets.iframe} onCopy={() => copy(snippets.iframe, "Iframe code")} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SnippetBox({ value, multiline, onCopy }: { value: string; multiline?: boolean; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const handle = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: "#0B1220", color: "#E2E8F0" }}>
      <code className={`text-[11px] flex-1 ${multiline ? "whitespace-pre-wrap break-all" : "truncate"}`}>{value}</code>
      <button onClick={handle} className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded" style={{ background: "rgba(56,189,248,0.15)", color: "#7DD3FC" }}>
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}
