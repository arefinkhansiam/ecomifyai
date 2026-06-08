import { Star } from "lucide-react";

const reviews = [
  { text: "We added Ecomify to our furniture store last month. Our return rate dropped by 35% and customers spend twice as long on product pages.", name: "Rahul M.", store: "HomeDecor BD", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces" },
  { text: "Upload a photo, get AR in 3 seconds. My conversion rate went up 28% in 2 weeks.", name: "Sarah K.", store: "StyleLoop Store", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces" },
  { text: "Our electronics store saw a massive boost in customer confidence. Fewer calls, more sales.", name: "Ahmed F.", store: "TechMart Online", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces" },
  { text: "Ecomify's embed code worked perfectly with our custom site. Took 5 minutes to set up.", name: "Priya S.", store: "GadgetHub", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces" },
  { text: "We sell handmade furniture and photos never did justice. Our sales are up 40% this quarter.", name: "Karim L.", store: "WoodCraft Store", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces" },
  { text: "Every product with AR gets 3x more views. We are adding AR to our entire catalog.", name: "Mei T.", store: "LuxeLiving Shop", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces" },
];

export function ReviewCarousel() {
  const items = [...reviews, ...reviews];
  return (
    <div className="overflow-hidden">
      <div className="flex scroll-x" style={{ width: "max-content" }}>
        {items.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 sm:p-7 mr-4 sm:mr-6 w-[78vw] sm:w-auto"
            style={{
              maxWidth: 360,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(2,132,199,0.18)",
              boxShadow: "0 20px 50px -25px rgba(2,132,199,0.35)",
            }}
          >
            <div className="flex gap-1 mb-3">
              {[0,1,2,3,4].map((s) => <Star key={s} size={16} style={{ color: "#0EA5E9" }} fill="currentColor" />)}
            </div>
            <p className="text-[15px] leading-relaxed mb-5" style={{ color: "var(--ink)" }}>{r.text}</p>
            <div className="flex items-center gap-3">
              <img
                src={r.avatar}
                alt={r.name}
                loading="lazy"
                className="w-11 h-11 rounded-full object-cover"
                style={{ border: "2px solid rgba(2,132,199,0.35)" }}
              />
              <div>
                <div className="font-display text-sm font-semibold" style={{ color: "var(--ink)" }}>{r.name}</div>
                <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{r.store}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
