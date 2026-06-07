import { Star } from "lucide-react";

const reviews = [
  { text: "We added Easibie to our furniture store last month. Our return rate dropped by 35% and customers spend twice as long on product pages.", name: "Rahul M.", store: "HomeDecor BD", color: "#7C3AED" },
  { text: "Upload a photo, get AR in 3 seconds. My conversion rate went up 28% in 2 weeks.", name: "Sarah K.", store: "StyleLoop Store", color: "#06B6D4" },
  { text: "Our electronics store saw a massive boost in customer confidence. Fewer calls, more sales.", name: "Ahmed F.", store: "TechMart Online", color: "#10B981" },
  { text: "Easibie's embed code worked perfectly with our custom site. Took 5 minutes to set up.", name: "Priya S.", store: "GadgetHub", color: "#F59E0B" },
  { text: "We sell handmade furniture and photos never did justice. Our sales are up 40% this quarter.", name: "Karim L.", store: "WoodCraft Store", color: "#EF4444" },
  { text: "Every product with AR gets 3x more views. We are adding AR to our entire catalog.", name: "Mei T.", store: "LuxeLiving Shop", color: "#9D5FF5" },
];

export function ReviewCarousel() {
  const items = [...reviews, ...reviews];
  return (
    <div className="overflow-hidden">
      <div className="flex scroll-x" style={{ width: "max-content" }}>
        {items.map((r, i) => (
          <div key={i} className="bg-card rounded-2xl p-7 mr-6" style={{ minWidth: 320, maxWidth: 360 }}>
            <div className="flex gap-1 mb-3">
              {[0,1,2,3,4].map((s) => <Star key={s} size={16} className="text-cyan" fill="currentColor" />)}
            </div>
            <p className="text-white text-[15px] leading-relaxed mb-5">{r.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full grid place-items-center font-display font-bold text-white" style={{ background: r.color }}>
                {r.name[0]}
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-white">{r.name}</div>
                <div className="text-xs text-muted">{r.store}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
