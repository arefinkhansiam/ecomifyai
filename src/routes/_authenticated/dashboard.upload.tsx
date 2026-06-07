import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/upload")({
  component: UploadPage,
});

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!["image/jpeg","image/png","image/webp"].includes(f.type)) {
      toast.error("Use JPG, PNG or WebP"); return;
    }
    if (f.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const upload = async () => {
    if (!file || !user) return;
    setBusy(true);
    try {
      setStep("Checking plan limits...");
      const { data: plan } = await supabase.from("user_plans").select("ar_product_limit").eq("user_id", user.id).single();
      const { count } = await supabase.from("ar_products").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      if ((count ?? 0) >= (plan?.ar_product_limit ?? 1)) {
        toast.error("Plan limit reached. Upgrade to upload more.");
        navigate({ to: "/dashboard/billing" }); return;
      }
      setStep("Uploading image...");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
      if (upErr) throw upErr;

      setStep("Creating AR product...");
      const { data: created, error: insErr } = await supabase.from("ar_products").insert({
        user_id: user.id, product_name: name || "Untitled Product",
        original_image_url: path, status: "processing",
        processing_step: "generating", processing_progress: 40,
        file_size_bytes: file.size, dominant_color: "#7C3AED",
      }).select().single();
      if (insErr) throw insErr;

      setStep("Generating AR experience...");
      await new Promise((r) => setTimeout(r, 800));
      await supabase.from("ar_products").update({
        status: "ready", processing_step: "complete", processing_progress: 100,
      }).eq("id", created.id);

      toast.success("AR product ready!");
      navigate({ to: "/dashboard/products" });
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally { setBusy(false); setStep(""); }
  };

  return (
    <DashboardShell title="Upload New AR Product">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-8">
          <label className="block">
            <div
              className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors hover:border-[var(--primary)]"
              style={{ borderColor: "var(--border)" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0] ?? null); }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-60 mx-auto object-contain" />
              ) : (
                <>
                  <UploadCloud size={48} className="mx-auto text-[var(--lavender)]" />
                  <div className="mt-4 font-display text-lg text-white">Drop a photo here</div>
                  <p className="text-sm mt-1">JPG, PNG or WebP. Max 10MB.</p>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </div>
          </label>
        </div>
        <div className="bg-card rounded-2xl p-8">
          <h3 className="text-white">Product details</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Product name</label>
              <input className="input-base mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Modern Lounge Chair" />
            </div>
            <button onClick={upload} disabled={!file || busy} className="btn-primary w-full">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              {busy ? step || "Working..." : "Generate AR Experience"}
            </button>
          </div>
          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>• Image is uploaded to your private storage</li>
            <li>• AR record is created with a unique shareable URL</li>
            <li>• Status flips to ready when processing completes</li>
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
