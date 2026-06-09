import { useEffect, useState } from "react";
import { Plus, X, Bookmark } from "lucide-react";
import { ColorControl } from "./ColorControl";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";

export type GradientStop = { color: string; position: number };
export type GradientDirection = "horizontal" | "vertical" | "diagonal" | "radial";

export type GradientValue = {
  stops: GradientStop[];
  direction: GradientDirection;
  angle: number;
};

export function gradientToCSS(g: GradientValue): string {
  const sorted = [...g.stops].sort((a, b) => a.position - b.position);
  const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
  if (g.direction === "radial") return `radial-gradient(circle, ${stopsStr})`;
  const angle = g.direction === "horizontal" ? 90 : g.direction === "vertical" ? 180 : g.angle;
  return `linear-gradient(${angle}deg, ${stopsStr})`;
}

const DEFAULT: GradientValue = {
  stops: [{ color: "#7C3AED", position: 0 }, { color: "#38BDF8", position: 100 }],
  direction: "diagonal",
  angle: 135,
};

export function parseGradient(input: GradientValue | string | undefined): GradientValue {
  if (input && typeof input === "object" && "stops" in input) return input;
  return DEFAULT;
}

export function GradientBuilder({
  value,
  onChange,
}: {
  value: GradientValue | undefined;
  onChange: (v: GradientValue) => void;
}) {
  const { user } = useAuth();
  const g = parseGradient(value);
  const [presets, setPresets] = useState<Array<{ id: string; name: string; css: string; data: GradientValue }>>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("vendor_gradients" as any)
        .select("id, name, css, stops, direction, angle")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12);
      setPresets((data ?? []).map((r: any) => ({
        id: r.id, name: r.name, css: r.css,
        data: { stops: r.stops, direction: r.direction, angle: r.angle },
      })));
    })();
  }, [user]);

  const update = (next: GradientValue) => onChange(next);

  const addStop = () => {
    if (g.stops.length >= 8) return;
    const positions = g.stops.map((s) => s.position).sort((a, b) => a - b);
    let pos = 50;
    for (let i = 0; i < positions.length - 1; i++) {
      const gap = positions[i + 1] - positions[i];
      if (gap > 10) { pos = positions[i] + gap / 2; break; }
    }
    update({ ...g, stops: [...g.stops, { color: "#EC4899", position: Math.round(pos) }] });
  };

  const removeStop = (idx: number) => {
    if (g.stops.length <= 2) return;
    update({ ...g, stops: g.stops.filter((_, i) => i !== idx) });
  };

  const updateStop = (idx: number, patch: Partial<GradientStop>) => {
    update({ ...g, stops: g.stops.map((s, i) => (i === idx ? { ...s, ...patch } : s)) });
  };

  const savePreset = async () => {
    if (!user) return;
    const name = `Gradient ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const css = gradientToCSS(g);
    const { data, error } = await supabase.from("vendor_gradients" as any).insert({
      user_id: user.id, name, stops: g.stops, direction: g.direction, angle: g.angle, css,
    } as any).select("id, name, css").maybeSingle();
    if (error) { toast.error("Could not save"); return; }
    if (data) setPresets([{ id: (data as any).id, name, css, data: g }, ...presets]);
    toast.success("Gradient saved");
  };

  const deletePreset = async (id: string) => {
    await supabase.from("vendor_gradients" as any).delete().eq("id", id);
    setPresets(presets.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Live preview bar */}
      <div className="h-16 rounded-xl border" style={{ background: gradientToCSS(g), borderColor: "var(--border)" }} />

      {/* Direction */}
      <div>
        <div className="text-[10px] uppercase text-muted mb-1">Direction</div>
        <div className="grid grid-cols-4 gap-1.5">
          {(["horizontal", "vertical", "diagonal", "radial"] as const).map((d) => (
            <button
              key={d}
              onClick={() => update({ ...g, direction: d })}
              className="px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors"
              style={{
                borderColor: g.direction === d ? "var(--primary)" : "var(--border)",
                background: g.direction === d ? "color-mix(in oklab, var(--primary) 10%, white)" : "#fff",
                color: g.direction === d ? "var(--primary)" : "var(--ink-soft)",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Angle (linear only) */}
      {g.direction === "diagonal" && (
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase text-muted mb-1">
            <span>Angle</span><span className="font-mono">{g.angle}°</span>
          </div>
          <input type="range" min={0} max={360} value={g.angle}
            onChange={(e) => update({ ...g, angle: Number(e.target.value) })}
            className="w-full accent-sky-500" />
        </div>
      )}

      {/* Stops */}
      <div>
        <div className="flex items-center justify-between text-[10px] uppercase text-muted mb-1">
          <span>Color stops · {g.stops.length}</span>
          <button onClick={addStop} disabled={g.stops.length >= 8}
            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 disabled:opacity-40">
            <Plus size={10} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {g.stops.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <ColorControl value={s.color} onChange={(c) => updateStop(i, { color: c })} allowAlpha />
              </div>
              <div className="w-24">
                <input
                  type="number" min={0} max={100} value={s.position}
                  onChange={(e) => updateStop(i, { position: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                  className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono text-center"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <button
                onClick={() => removeStop(i)}
                disabled={g.stops.length <= 2}
                className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-red-500 disabled:opacity-30"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Saved presets */}
      <div>
        <div className="flex items-center justify-between text-[10px] uppercase text-muted mb-1">
          <span>Saved presets</span>
          <button onClick={savePreset} className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700">
            <Bookmark size={10} /> Save current
          </button>
        </div>
        {presets.length === 0 ? (
          <div className="text-[11px] text-muted">No saved gradients yet.</div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            {presets.map((p) => (
              <div key={p.id} className="relative group">
                <button
                  onClick={() => update(p.data)}
                  className="w-full h-10 rounded-md border hover:scale-105 transition-transform"
                  style={{ background: p.css, borderColor: "rgba(0,0,0,0.1)" }}
                  title={p.name}
                />
                <button
                  onClick={() => deletePreset(p.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border grid place-items-center opacity-0 group-hover:opacity-100"
                  style={{ borderColor: "var(--border)" }}
                >
                  <X size={9} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
