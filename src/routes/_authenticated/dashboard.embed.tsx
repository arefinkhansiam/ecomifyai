import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Copy, Download, QrCode } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/embed")({
  validateSearch: (s: Record<string, unknown>) => ({
    product: typeof s.product === "string" ? s.product : undefined,
  }),
  component: EmbedPage,
});

function EmbedPage() {
  const { user } = useAuth();
  const search = Route.useSearch();
  const [products, setProducts] = useState<{ id: string; product_name: string }[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [qrData, setQrData] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://easibie.com";

  useEffect(() => {
    if (!user) return;
    supabase.from("ar_products").select("id, product_name").eq("user_id", user.id).eq("status", "ready").then(({ data }) => {
      const rows = data ?? [];
      setProducts(rows);
      const requested = search.product && rows.some((p) => p.id === search.product) ? search.product : rows[0]?.id;
      if (requested) setSelected(requested);
    });
  }, [user, search.product]);

  useEffect(() => {
    if (!selected) return;
    QRCode.toDataURL(`${origin}/ar/view/${selected}`, { width: 400, color: { dark: "#FFFFFF", light: "#0A0A0F" } })
      .then(setQrData);
  }, [selected, origin]);

  const url = selected ? `${origin}/ar/view/${selected}` : "";
  const embedCode = `<iframe src="${url}" width="100%" height="640" style="border:0;border-radius:16px" allow="xr-spatial-tracking; camera"></iframe>`;
  const widgetSnippet = `<!-- Easibie Try-On button — paste anywhere on your website -->\n<script src="${origin}/widget.js" data-product-id="${selected}" async></script>`;
  const shopifyLiquid = `{% comment %} Easibie Try-On button — Shopify {% endcomment %}\n{% comment %} Paste in your product template (e.g. sections/main-product.liquid) {% endcomment %}\n<div class="easibie-tryon" style="margin-top:12px;">\n  <script src="${origin}/widget.js" data-product-id="${selected}" async></script>\n</div>`;
  const platformSnippet = `<!-- Easibie Try-On link -->\n<a href="${url}" target="_blank" rel="noreferrer">Try it on</a>`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  if (products.length === 0) {
    return (
      <DashboardShell title="Embed and Share">
        <div className="bg-card rounded-2xl p-12 text-center">
          <QrCode size={48} className="mx-auto text-[var(--lavender)]" />
          <h3 className="text-white mt-4">No ready products yet</h3>
          <p className="mt-2 text-sm">Upload and wait for processing to complete to grab embed codes.</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Embed and Share">
      <div className="mb-6">
        <label className="text-xs text-muted uppercase tracking-wide">Product</label>
        <select className="input-base mt-1 max-w-md" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.product_name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 10px 30px -18px rgba(2,132,199,0.45)" }}>
          <h3 className="text-base font-semibold m-0" style={{ background: "linear-gradient(135deg,#0B1220,#0369A1,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>QR code</h3>
          {qrData ? (
            <>
              <img src={qrData} alt="QR" className="mt-4 w-56 h-56 rounded-xl p-3" style={{ background: "linear-gradient(135deg,#0B1220,#0369A1)" }} />
              <a href={qrData} download={`easibie-qr.png`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md text-white" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}><Download size={12} /> Download PNG</a>
            </>
          ) : <div className="mt-4 w-56 h-56 rounded-xl bg-slate-100 animate-pulse" />}
        </div>
        <div className="rounded-2xl p-6 space-y-5" style={{ background: "#fff", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 10px 30px -18px rgba(2,132,199,0.45)" }}>
          <Block title="Direct link" value={url} onCopy={() => copy(url, "Link")} />
          <Block title="Your website (no Shopify needed)" hint="Paste this script on any website — it renders your branded Try-On button automatically." value={widgetSnippet} onCopy={() => copy(widgetSnippet, "Website snippet")} multiline />
          <Block title="Shopify (Liquid)" hint="Paste into your product template, e.g. sections/main-product.liquid." value={shopifyLiquid} onCopy={() => copy(shopifyLiquid, "Shopify code")} multiline />
          <Block title="Embed code (iframe)" value={embedCode} onCopy={() => copy(embedCode, "Embed code")} multiline />
          <Block title="Simple link" value={platformSnippet} onCopy={() => copy(platformSnippet, "Snippet")} multiline />
        </div>
      </div>
    </DashboardShell>
  );
}

function Block({ title, hint, value, onCopy, multiline }: { title: string; hint?: string; value: string; onCopy: () => void; multiline?: boolean }) {
  return (
    <div>
      <h3 className="text-[13px] font-bold m-0" style={{ background: "linear-gradient(135deg,#0B1220,#0369A1,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{title}</h3>
      {hint && <p className="text-[11px] mt-1" style={{ color: "#64748B" }}>{hint}</p>}
      <div className="mt-2 rounded-lg p-3 flex items-start gap-2" style={{ background: "linear-gradient(135deg,#0B1220 0%,#0C2A4A 60%,#0369A1 100%)", border: "1px solid rgba(56,189,248,0.25)" }}>
        <code className={`text-[11.5px] font-mono flex-1 ${multiline ? "whitespace-pre-wrap break-all" : "truncate"}`} style={{ color: "#E0F2FE" }}>{value}</code>
        <button onClick={onCopy} className="flex-shrink-0 w-7 h-7 grid place-items-center rounded" style={{ background: "linear-gradient(135deg,#0EA5E9,#38BDF8)", color: "#fff" }} title="Copy">
          <Copy size={12} />
        </button>
      </div>
    </div>
  );
}
