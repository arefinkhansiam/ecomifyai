import { useEffect, useRef, useState } from "react";

export function StatCounter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(target * eased));
            if (p < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display font-extrabold text-white text-4xl md:text-5xl">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm text-muted">{label}</div>
    </div>
  );
}
