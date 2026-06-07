import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Easibie — Spatial Commerce, For Everyone" },
      { name: "description", content: "We build the AR layer of e-commerce so every store, big or small, can let customers see products in their space." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <MarketingShell>
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="pill">About</span>
          <h1 className="mt-6 text-white">Spatial commerce, for everyone.</h1>
          <p className="mt-6 text-lg">
            Easibie was founded with a simple belief: every online store should be able to give customers a true sense of the product. AR used to mean expensive 3D modeling and developer teams. We made it as easy as uploading a photo.
          </p>
        </div>
        <div className="mx-auto max-w-5xl px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { k: "10k+", v: "Active stores" },
            { k: "2.4M", v: "AR experiences delivered" },
            { k: "30%", v: "Average sales lift" },
          ].map((x) => (
            <div key={x.k} className="bg-card rounded-2xl p-8 text-center">
              <div className="font-display text-4xl font-extrabold text-white">{x.k}</div>
              <div className="mt-2 text-sm text-muted">{x.v}</div>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-3xl px-6 mt-16 space-y-6 text-[17px]">
          <p>We are a small team of designers, engineers and store owners. We obsess over conversion, latency and the smallest details of every AR placement.</p>
          <p>Our mission is to make commerce feel real — wherever your customers happen to be.</p>
        </div>
      </section>
    </MarketingShell>
  );
}
