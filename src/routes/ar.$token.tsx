import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Sparkles } from "lucide-react";

const Input = z.object({ token: z.string().min(8).max(64) });

const resolveProductByToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product } = await supabaseAdmin
      .from("ar_products")
      .select("id, is_public, status")
      .eq("embed_token", data.token)
      .maybeSingle();
    if (!product || !product.is_public || product.status !== "ready") return null;
    await supabaseAdmin.rpc("increment_view_by_token", { p_token: data.token });
    return { id: product.id };
  });

export const Route = createFileRoute("/ar/$token")({
  ssr: false,
  loader: async ({ params }) => {
    const product = await resolveProductByToken({ data: { token: params.token } });
    if (!product) throw notFound();
    throw redirect({ to: "/ar/view/$productId", params: { productId: product.id } });
  },
  notFoundComponent: NotReady,
  errorComponent: NotReady,
  component: () => null,
});

function NotReady() {
  return (
    <div className="min-h-screen grid place-items-center text-center px-6 bg-soft text-ink">
      <div>
        <Sparkles size={48} className="mx-auto text-primary" />
        <h2 className="mt-4 font-display text-2xl">Try-On unavailable</h2>
        <p className="mt-2 text-muted">This link is invalid or the product is still processing.</p>
      </div>
    </div>
  );
}
