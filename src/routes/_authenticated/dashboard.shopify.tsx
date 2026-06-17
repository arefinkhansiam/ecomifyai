import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Store, RefreshCw, Unlink, ExternalLink, ShoppingBag, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import {
  disconnectShopifyStore,
  getShopifyOverview,
  resyncShopifyProducts,
  toggleTryOnProduct,
} from "@/lib/shopify.functions";

export const Route = createFileRoute("/_authenticated/dashboard/shopify")({
  component: ShopifyPage,
});

function ShopifyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const overviewFn = useServerFn(getShopifyOverview);
  const toggleFn = useServerFn(toggleTryOnProduct);
  const disconnectFn = useServerFn(disconnectShopifyStore);
  const resyncFn = useServerFn(resyncShopifyProducts);

  const [shopInput, setShopInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["shopify-overview"],
    queryFn: () => overviewFn(),
  });

  // Handle redirect-back from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "1") {
      const synced = params.get("synced");
      const err = params.get("sync_error");
      if (err) toast.error(`Connected, but sync failed: ${err}`);
      else toast.success(`Shopify connected. Synced ${synced ?? 0} products.`);
      window.history.replaceState({}, "", "/dashboard/shopify");
      qc.invalidateQueries({ queryKey: ["shopify-overview"] });
    }
  }, [qc]);

  const toggleMut = useMutation({
    mutationFn: (vars: { productId: string; enabled: boolean }) => toggleFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopify-overview"] }),
    onError: (e: any) => toast.error(e?.message || "Failed to update"),
  });

  const disconnectMut = useMutation({
    mutationFn: () => disconnectFn(),
    onSuccess: () => {
      toast.success("Store disconnected");
      qc.invalidateQueries({ queryKey: ["shopify-overview"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to disconnect"),
  });

  const resyncMut = useMutation({
    mutationFn: () => resyncFn(),
    onSuccess: (r: any) => {
      toast.success(`Re-synced ${r?.synced ?? 0} products`);
      qc.invalidateQueries({ queryKey: ["shopify-overview"] });
    },
    onError: (e: any) => toast.error(e?.message || "Re-sync failed"),
  });

  function startInstall() {
    if (!user?.id) {
      toast.error("Please sign in");
      return;
    }
    const raw = shopInput.trim().toLowerCase().replace(/^https?:\/\//, "");
    let cleaned = "";
    const adminMatch = raw.match(/^admin\.shopify\.com\/store\/([a-z0-9-]+)/);
    if (adminMatch) {
      cleaned = `${adminMatch[1]}.myshopify.com`;
    } else {
      cleaned = raw.replace(/\/.*$/, "");
      if (cleaned && !cleaned.includes(".")) cleaned = `${cleaned}.myshopify.com`;
    }
    if (!cleaned || !cleaned.endsWith(".myshopify.com")) {
      toast.error("Enter a .myshopify.com domain or admin.shopify.com/store/<handle> link");
      return;
    }
    const params = new URLSearchParams({ shop: cleaned, user_id: user.id });
    window.location.href = `/api/public/shopify/install?${params.toString()}`;
  }

  return (
    <DashboardShell title="Shopify Integration">
      <div className="max-w-5xl mx-auto space-y-6 py-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--ink)]">Shopify Integration</h1>
          <p className="text-[var(--ink-soft)] mt-1">
            Connect your Shopify store to automatically sync products and enable Easibie virtual try-on inside your product pages.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-[var(--ink-soft)]"><Loader2 className="animate-spin h-4 w-4" /> Loading…</div>
        ) : !data?.store ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Connect your Shopify store</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--ink-soft)]">
                Enter your Shopify <code className="px-1 py-0.5 bg-black/5 rounded">.myshopify.com</code> domain (not your custom domain). You can find it in Shopify admin → Settings → Domains, listed as your "primary myshopify domain".
              </p>
              <div className="grid gap-2">
                <Label htmlFor="shop">Shopify store domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="shop"
                    placeholder="yourstore.myshopify.com"
                    value={shopInput}
                    onChange={(e) => setShopInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startInstall()}
                  />
                  <Button onClick={startInstall}>
                    Connect <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <p className="text-xs text-[var(--ink-soft)]">
                  Permissions requested: read products, inventory, orders; write script tags.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" /> Connected
                  </span>
                  <Badge variant="secondary">{data.store.sync_status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[var(--ink-soft)]">Store</div>
                  <div className="font-medium">{data.store.shop_name || data.store.shop_domain}</div>
                  <div className="text-xs text-[var(--ink-soft)]">{data.store.shop_domain}</div>
                </div>
                <div>
                  <div className="text-[var(--ink-soft)]">Currency</div>
                  <div className="font-medium">{data.store.currency || "—"}</div>
                </div>
                <div>
                  <div className="text-[var(--ink-soft)]">Installed</div>
                  <div className="font-medium">{new Date(data.store.installed_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[var(--ink-soft)]">Last sync</div>
                  <div className="font-medium">{data.store.last_synced_at ? new Date(data.store.last_synced_at).toLocaleString() : "—"}</div>
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" onClick={() => resyncMut.mutate()} disabled={resyncMut.isPending}>
                    {resyncMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                    Re-sync products
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Disconnect this Shopify store? Synced product data will be removed.")) disconnectMut.mutate();
                    }}
                    disabled={disconnectMut.isPending}
                  >
                    <Unlink className="h-4 w-4 mr-1" /> Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Products ({data.counts.total}) — Try-on enabled: {data.counts.enabled}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.products.length === 0 ? (
                  <div className="text-sm text-[var(--ink-soft)] flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> No products synced yet. Try Re-sync above.
                  </div>
                ) : (
                  <div className="divide-y">
                    {data.products.map((p: any) => {
                      const img = (p.images?.[0]?.url) || null;
                      return (
                        <div key={p.id} className="flex items-center gap-4 py-3">
                          <div className="w-14 h-14 rounded-md bg-black/5 overflow-hidden flex-shrink-0">
                            {img ? <img src={img} alt={p.title} className="w-full h-full object-cover" /> : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{p.title}</div>
                            <div className="text-xs text-[var(--ink-soft)] truncate">
                              {p.vendor ? `${p.vendor} · ` : ""}{p.product_type || "—"}
                              {p.tryon_category ? <Badge variant="outline" className="ml-2">{p.tryon_category}</Badge> : null}
                            </div>
                          </div>
                          <div className="text-right text-sm hidden sm:block min-w-[80px]">
                            {p.price_min != null ? `${p.currency || ""} ${p.price_min}${p.price_max && p.price_max !== p.price_min ? `–${p.price_max}` : ""}` : "—"}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--ink-soft)]">Try-on</span>
                            <Switch
                              checked={!!p.tryon_enabled}
                              onCheckedChange={(val) => toggleMut.mutate({ productId: p.id, enabled: val })}
                              disabled={toggleMut.isPending}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
