import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { z } from "zod";
import { Sparkles } from "lucide-react";

const Input = z.object({ token: z.string().min(8).max(64) });

const loadProductByToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product } = await supabaseAdmin
      .from("ar_products")
      .select("id, product_name, processed_image_url, original_image_url, glb_url, usdz_url, dominant_color, status, is_public, ar_mode, ar_customization, embed_token")
      .eq("embed_token", data.token)
      .maybeSingle();
    if (!product || !product.is_public || product.status !== "ready") return null;

    const sign = async (p: string | null) => {
      if (!p) return null;
      const { data: s } = await supabaseAdmin.storage.from("product-images").createSignedUrl(p, 3600);
      return s?.signedUrl ?? null;
    };
    const [imageUrl, originalUrl, glbUrl, usdzUrl] = await Promise.all([
      sign(product.processed_image_url),
      sign(product.original_image_url),
      sign(product.glb_url),
      sign(product.usdz_url),
    ]);

    // bump view count (fire and forget)
    await supabaseAdmin.rpc("increment_view_by_token", { p_token: data.token });

    return {
      id: product.id,
      name: product.product_name,
      mode: product.ar_mode as string,
      dominant: product.dominant_color as string | null,
      imageUrl: imageUrl ?? originalUrl,
      glbUrl,
      usdzUrl,
      customization: (product.ar_customization ?? {}) as any,
    };
  });

export const Route = createFileRoute("/ar/$token")({
  ssr: false,
  head: ({ loaderData }) => {
    const name = (loaderData as any)?.name as string | undefined;
    return {
      meta: [
        { title: name ? `${name} — AR Viewer` : "AR Viewer" },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
        { name: "description", content: "View this product in your space with AR." },
      ],
    };
  },
  loader: async ({ params }) => {
    const product = await loadProductByToken({ data: { token: params.token } });
    if (!product) throw notFound();
    return product;
  },
  notFoundComponent: NotReady,
  errorComponent: NotReady,
  component: ArByToken,
});

function NotReady() {
  return (
    <div className="min-h-screen grid place-items-center text-center px-6 bg-[#0B1220] text-white">
      <div>
        <Sparkles size={48} className="mx-auto text-sky-400" />
        <h2 className="mt-4 font-display text-2xl">AR experience unavailable</h2>
        <p className="mt-2 text-white/70">This link is invalid or the product is still processing.</p>
      </div>
    </div>
  );
}

function ArByToken() {
  const product = Route.useLoaderData();

  useEffect(() => {
    if (document.querySelector('script[data-mv]')) return;
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    s.setAttribute("data-mv", "1");
    document.head.appendChild(s);
  }, []);

  const c = product.customization ?? {};
  const pageBg = c.page_bg || "#0B1220";
  const fontColor = c.font_color || "#FFFFFF";
  const accent = c.accent_color || product.dominant || "#38BDF8";
  const showName = c.show_product_name !== false;
  const btnText = c.custom_button_text || "View in Your Space";

  const has3d = !!product.glbUrl;

  return (
    <div className="min-h-screen" style={{ background: pageBg, color: fontColor }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {showName && (
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{product.name}</h1>
        )}

        <div className="mt-4 rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {has3d ? (
            <ModelViewer src={product.glbUrl!} iosSrc={product.usdzUrl ?? undefined} pageBg={pageBg} />
          ) : (
            <div className="aspect-square grid place-items-center" style={{ background: `radial-gradient(ellipse at center, ${accent}22, transparent 70%)` }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name}
                  className="max-h-[70vh] max-w-full object-contain animate-[spin_22s_linear_infinite] [animation-play-state:running]" />
              ) : <Sparkles size={64} style={{ color: accent }} />}
            </div>
          )}
        </div>

        {!has3d && (
          <div className="mt-4 text-center text-xs rounded-2xl px-4 py-3" style={{ background: "rgba(56,189,248,0.08)", color: "#bae6fd", border: "1px solid rgba(56,189,248,0.18)" }}>
            AI 3D preview · True GLB/USDZ AR coming when a 3D pipeline is connected
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <a
            href={product.imageUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider"
            style={{ background: accent, color: "#0B1220", boxShadow: `0 16px 40px -16px ${accent}` }}
          >
            {btnText}
          </a>
        </div>
      </div>
    </div>
  );
}
