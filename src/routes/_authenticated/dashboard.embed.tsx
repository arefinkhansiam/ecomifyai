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
  const shopify = `{% comment %} Easibie AR {% endcomment %}\n<a href="${url}" target="_blank" rel="noreferrer">View in AR</a>`;

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
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-white">QR code</h3>
          {qrData ? (
            <>
              <img src={qrData} alt="QR" className="mt-4 w-56 h-56 rounded-xl bg-[var(--bg)] p-3" />
              <a href={qrData} download={`easibie-qr.png`} className="btn-ghost text-xs mt-4 inline-flex"><Download size={12} /> Download PNG</a>
            </>
          ) : <div className="mt-4 w-56 h-56 rounded-xl bg-[var(--bg)] animate-pulse" />}
        </div>
        <div className="bg-card rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-white">Direct link</h3>
            <div className="mt-2 bg-[var(--bg)] rounded-lg p-3 flex items-center gap-2">
              <code className="text-xs text-cyan truncate flex-1">{url}</code>
              <button onClick={() => copy(url, "Link")} className="text-muted hover:text-white"><Copy size={14} /></button>
            </div>
          </div>
          <div>
            <h3 className="text-white">Embed code</h3>
            <div className="mt-2 bg-[var(--bg)] rounded-lg p-3 flex items-start gap-2">
              <code className="text-xs text-muted flex-1 break-all">{embedCode}</code>
              <button onClick={() => copy(embedCode, "Embed code")} className="text-muted hover:text-white"><Copy size={14} /></button>
            </div>
          </div>
          <div>
            <h3 className="text-white">Shopify snippet</h3>
            <div className="mt-2 bg-[var(--bg)] rounded-lg p-3 flex items-start gap-2">
              <code className="text-xs text-muted flex-1 break-all whitespace-pre-wrap">{shopify}</code>
              <button onClick={() => copy(shopify, "Snippet")} className="text-muted hover:text-white"><Copy size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
