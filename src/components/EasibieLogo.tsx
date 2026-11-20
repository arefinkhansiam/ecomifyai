import { Link } from "@tanstack/react-router";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "dark";
  showSubtitle?: boolean;
  clickable?: boolean;
  className?: string;
}

export function EasibieLogo({
  size = "md",
  variant = "default",
  showSubtitle = false,
  clickable = true,
  className = "",
}: LogoProps) {
  // Dimension mapping
  const iconSize = size === "sm" ? 22 : size === "md" ? 28 : size === "lg" ? 36 : 44;
  const textSize = size === "sm" ? "text-[16px]" : size === "md" ? "text-[18px]" : size === "lg" ? "text-[22px]" : "text-[26px]";
  const subSize = size === "sm" ? "text-[9px]" : "text-[10px]";

  const isWhite = variant === "white";
  const textColor = isWhite ? "text-white" : "text-[#0F172A]";
  const subColor = isWhite ? "text-slate-300" : "text-[#64748B]";
  const dotColor = isWhite ? "text-sky-300" : "text-[#1E40AF]";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Icon Emblem: Precision Geometric Hanger + Diamond Folding "E" */}
      <div
        className="shrink-0 relative rounded-lg grid place-items-center transition-transform duration-200 group-hover:scale-105"
        style={{
          width: iconSize + 4,
          height: iconSize + 4,
          background: isWhite
            ? "rgba(255, 255, 255, 0.15)"
            : "linear-gradient(135deg, #0F172A 0%, #1E40AF 60%, #2563EB 100%)",
          border: isWhite ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(30, 64, 175, 0.3)",
          boxShadow: isWhite ? "none" : "0 2px 8px -1px rgba(30, 64, 175, 0.35)",
        }}
      >
        <svg
          width={iconSize - 4}
          height={iconSize - 4}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer structured apparel hanger / spatial coat silhouette */}
          <path
            d="M12 3C10.8954 3 10 3.89543 10 5C10 5.86 10.54 6.59 11.31 6.88L4 10.5V13L12 17L20 13V10.5L12.69 6.88C13.46 6.59 14 5.86 14 5C14 3.89543 13.1046 3 12 3Z"
            stroke="white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner precision "E" bars */}
          <path
            d="M8.5 12.5H15.5M8.5 15H13.5M9.5 9.5H14.5"
            stroke="#93C5FD"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography: Clean, Letter-Spaced Corporate & High-Fashion Wordmark */}
      <div className="flex flex-col leading-none">
        <div className={`font-bold tracking-tight ${textSize} ${textColor} flex items-center`}>
          <span>Easibie</span>
          <span className={`font-semibold ml-0.5 ${dotColor}`}>.ai</span>
        </div>
        {showSubtitle && (
          <span className={`font-semibold uppercase tracking-wider ${subSize} ${subColor} mt-0.5`}>
            Virtual Try-On
          </span>
        )}
      </div>
    </div>
  );

  if (!clickable) return content;

  return (
    <Link to="/" className="outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg">
      {content}
    </Link>
  );
}
