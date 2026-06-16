import { Star } from "lucide-react";

const reviews = [
  { title: "Shipped my first campaign", text: "Went from concept to final cut over a weekend. My agency clients assume I have a full team behind me now.", name: "Noah Becker", initials: "NB", stars: 4 },
  { title: "Replaced three tools", text: "Dropped my photo editor, a video tool, and a stock subscription. Easibie does all three, and the try-on is unreal.", name: "Lina Vázquez", initials: "LV", stars: 4 },
  { title: "Worth the upgrade", text: "I sat on Free for a week, upgraded on Monday, and booked my first paid ad spot by Friday. Paid for itself.", name: "Trevor Iverson", initials: "TI", stars: 5 },
  { title: "Sharp on-brand visuals", text: "Try-ons match our brand colors and lighting. Revision cycles dropped from days to minutes.", name: "Mira Lindqvist", initials: "ML", stars: 5 },
  { title: "Conversions doubled", text: "Two weeks in, our product page conversion rate doubled. The try-on closes the deal for hesitant shoppers.", name: "Rahul Mehta", initials: "RM", stars: 5 },
  { title: "Furniture finally clicks", text: "Customers see the sofa in their actual living room. Returns dropped by a third in the first month.", name: "Sarah Kim", initials: "SK", stars: 5 },
  { title: "No-headache embed", text: "Pasted one snippet into Shopify and the widget was live. Took five minutes, not five days.", name: "Ahmed Farooq", initials: "AF", stars: 5 },
  { title: "Best AI try-on we tried", text: "Tested four competitors before this. Nothing else preserved skin tone and lighting this well.", name: "Mei Tanaka", initials: "MT", stars: 5 },
];

const GRAD = "linear-gradient(135deg, #0369A1 0%, #38BDF8 100%)";

function Row({ items, reverse = false }: { items: typeof reviews; reverse?: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className={`flex ${reverse ? "scroll-x-reverse" : "scroll-x"} gap-4 sm:gap-5`} style={{ width: "max-content" }}>
        {loop.map((r, i) => (
          <div
            key={i}
            className="rounded-xl p-3.5 shrink-0 w-[240px] sm:w-[260px] flex flex-col"
            style={{
              background: "rgba(15,23,42,0.85)",
              border: "none",
              boxShadow: "0 14px 30px -18px rgba(2,132,199,0.45)",
            }}
          >
            <div className="flex gap-0.5 mb-2">
              {[0,1,2,3,4].map((s) => (
                <Star key={s} size={11} style={{ color: s < r.stars ? "#38BDF8" : "rgba(255,255,255,0.18)" }} fill="currentColor" />
              ))}
            </div>
            <div className="font-display font-bold text-white text-[13px] mb-1.5 leading-tight">{r.title}</div>
            <p className="text-[11px] leading-snug mb-3 text-white/65 flex-1 line-clamp-3">{r.text}</p>
            <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-bold text-white shrink-0" style={{ background: GRAD }}>
                {r.initials}
              </div>
              <div className="text-[11px] font-semibold text-white/90 truncate">{r.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewCarousel() {
  const half = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, half);
  const row2 = reviews.slice(half);
  return (
    <div className="flex flex-col gap-5">
      <Row items={row1} />
      <Row items={row2} reverse />
    </div>
  );
}

