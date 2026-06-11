import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pretty Shopify-style URL: /ar/{storeSlug}/{productSlug}-{shortId}
// where shortId is the first 8 chars of the ar_products.id (uuid).
export const Route = createFileRoute("/ar/$store/$product")({
  ssr: false,
  component: ResolveAndRedirect,
});

function ResolveAndRedirect() {
  const { product } = Route.useParams();
  const [target, setTarget] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const m = product.match(/-([a-f0-9]{6,})$/i);
    const shortId = m?.[1];
    if (!shortId) { setNotFound(true); return; }
    supabase
      .from("ar_products")
      .select("id")
      .ilike("id", `${shortId}%`)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.id) setNotFound(true);
        else setTarget(`/ar/view/${data.id}`);
      });
  }, [product]);

  if (notFound) {
    return (
      <div className="min-h-screen grid place-items-center bg-soft text-center px-6">
        <div>
          <h2 className="text-ink mt-4">Try-on not found</h2>
          <p className="mt-2">This link is invalid or the product has been removed.</p>
          <a href="/" className="btn-primary mt-6">Back to home</a>
        </div>
      </div>
    );
  }
  if (!target) return <div className="min-h-screen grid place-items-center"><div className="text-sm text-muted">Loading try-on…</div></div>;
  return <Navigate to={target} replace />;
}
