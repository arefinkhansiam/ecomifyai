import { Star } from "lucide-react";

const reviews = [
  { title: "Shipped my first campaign", text: "Went from concept to final cut over a weekend. My agency clients assume I have a full team behind me now.", name: "Noah Becker", initials: "NB", stars: 4 },
  { title: "Replaced three tools", text: "Dropped my photo editor, a video tool, and a stock subscription. Ecomify does all three, and the try-on is unreal.", name: "Lina Vázquez", initials: "LV", stars: 4 },
  { title: "Worth the upgrade", text: "I sat on Free for a week, upgraded on Monday, and booked my first paid ad spot by Friday. Paid for itself.", name: "Trevor Iverson", initials: "TI", stars: 5 },
  { title: "Sharp on-brand visuals", text: "Try-ons match our brand colors and lighting. Revision cycles dropped from days to minutes.", name: "Mira Lindqvist", initials: "ML", stars: 5 },
  { title: "Conversions doubled", text: "Two weeks in, our product page conversion rate doubled. The try-on closes the deal for hesitant shoppers.", name: "Rahul Mehta", initials: "RM", stars: 5 },
  { title: "Furniture finally clicks", text: "Customers see the sofa in their actual living room. Returns dropped by a third in the first month.", name: "Sarah Kim", initials: "SK", stars: 5 },
  { title: "No-headache embed", text: "Pasted one snippet into Shopify and the widget was live. Took five minutes, not five days.", name: "Ahmed Farooq", initials: "AF", stars: 5 },
  { title: "Best AI try-on we tried", text: "Tested four competitors before this. Nothing else preserved skin tone and lighting this well.", name: "Mei Tanaka", initials: "MT", stars: 5 },
];

const GRAD = "linear-gradient(135deg, #0369A1 0%, #38BDF8 100%)";

export function ReviewCarousel() {
  const items = [...reviews, ...reviews];
  return (
    <div className="overflow-hidden">
      <div className="flex scroll-x gap-4 sm:gap-5" style={{ width: "max-content" }}>
        {items.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 sm:p-6 shrink-0 w-[78vw] sm:w-[360px] flex flex-col"
            style={{
              background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(56,189,248,0.18)",
              boxShadow: "0 20px 50px -25px rgba(2,132,199,0.45)",
            }}
          >
            <div className="flex gap-1 mb-3">
              {[0,1,2,3,4].map((s) => (
                <Star key={s} size={14} style={{ color: s < r.stars ? "#38BDF8" : "rgba(255,255,255,0.18)" }} fill="currentColor" />
              ))}
            </div>
            <div className="font-display font-bold text-white text-[16px] mb-2">{r.title}</div>
            <p className="text-[14px] leading-relaxed mb-5 text-white/70 flex-1">{r.text}</p>
            <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold text-white shrink-0" style={{ background: GRAD }}>
                {r.initials}
              </div>
              <div className="text-sm font-semibold text-white/90 truncate">{r.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
