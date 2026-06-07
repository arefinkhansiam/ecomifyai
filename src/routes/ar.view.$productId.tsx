import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "@/types/model-viewer";
import { Box, Smartphone, ExternalLink, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { detectARCapability, detectDeviceType } from "@/lib/ar-detect";

export const Route = createFileRoute("/ar/view/$productId")({
  head: ({ params }) => ({
    meta: [
      { title: `AR Viewer — Easibie` },
      { name: "description", content: `View this product in AR with Easibie.` },
      { property: "og:title", content: "View this product in AR" },
      { property: "og:description", content: "Powered by Easibie — AI-generated AR for e-commerce." },
    ],
  }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("ar_products")
      .select("id, product_name, processed_image_url, original_image_url, glb_url, usdz_url, dominant_color, status, is_public")
      .eq("id", params.productId)
      .maybeSingle();
    if (error || !data || data.status !== "ready" || !data.is_public) throw notFound();
    // try to get signed url for original image if no public processed
    let imageUrl: string | null = data.processed_image_url ?? null;
    if (!imageUrl && data.original_image_url) {
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(data.original_image_url, 3600);
      imageUrl = signed?.signedUrl ?? null;
    }
    return { product: data, imageUrl };
  },
  errorComponent: () => <NotReady />,
  notFoundComponent: () => <NotReady />,
  component: ARView,
});

function NotReady() {
  return (
    <div className="min-h-screen grid place-items-center bg-bg text-center px-6">
      <div>
        <Box size={48} className="text-[var(--lavender)] mx-auto" />
        <h2 className="mt-4 text-white">AR experience not available</h2>
        <p className="mt-2">The product link is invalid or the AR is still processing.</p>
      </div>
    </div>
  );
}

function ARView() {
  const { product, imageUrl } = Route.useLoaderData();
  const [cap, setCap] = useState<string>("fallback");

  useEffect(() => {
    const c = detectARCapability();
    const d = detectDeviceType();
    setCap(c);
    supabase.rpc("increment_ar_views", { p_product_id: product.id, p_device: d, p_capability: c });
  }, [product.id]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ url, title: product.product_name }).catch(() => {});
    else { await navigator.clipboard.writeText(url); alert("Link copied"); }
  };

  return (
    <div className="min-h-screen bg-bg text-white relative">
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 h-14"
        style={{ background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)" }}>
        <a href="/" className="font-display font-extrabold"><span className="text-cyan">E</span>ASIBIE</a>
        <button onClick={share} className="text-sm flex items-center gap-1 text-muted hover:text-white">
          <Share2 size={16} /> Share
        </button>
      </header>
      <main className="pt-14 min-h-screen flex flex-col">
        <div
          className="flex-1 grid place-items-center p-6"
          style={{ background: `radial-gradient(ellipse at 50% 30%, ${product.dominant_color}33, transparent 70%)` }}
        >
          {product.glb_url ? (
            <model-viewer
              src={product.glb_url}
              ios-src={product.usdz_url}
              alt={product.product_name}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: "100%", height: "60vh", maxWidth: 720, background: "transparent" }}
            />
          ) : imageUrl ? (
            <img src={imageUrl} alt={product.product_name} className="max-h-[60vh] max-w-full object-contain rounded-2xl" />
          ) : (
            <div className="w-64 h-64 rounded-2xl bg-card grid place-items-center">
              <Box size={64} className="text-[var(--lavender)]" />
            </div>
          )}
        </div>
        <div className="bg-surface p-6 text-center">
          <h2 className="text-white">{product.product_name}</h2>
          <p className="mt-2 text-sm">
            {cap === "quick-look" || cap === "scene-viewer"
              ? "Tap the AR icon to place this product in your room."
              : "Open on a phone to view in AR."}
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <a href="https://easibie.com" className="btn-ghost text-xs">
              <ExternalLink size={14} /> Get Easibie
            </a>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Smartphone size={14} /> {cap.toUpperCase()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
