import { Link } from "@tanstack/react-router";
import easibieLogoImg from "@/assets/easibie-logo.jpg";

interface EasibieLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  textColor?: string;
  className?: string;
  linkTo?: string | null;
}

export function EasibieLogo({
  size = "md",
  showText = true,
  showSubtitle = false,
  textColor = "text-ink",
  className = "",
  linkTo = "/",
}: EasibieLogoProps) {
  const sizeMap = {
    xs: { box: "w-6 h-6", text: "text-[14px]", sub: "text-[9px]" },
    sm: { box: "w-7 h-7", text: "text-[16px]", sub: "text-[10px]" },
    md: { box: "w-8 h-8", text: "text-[18px]", sub: "text-[11px]" },
    lg: { box: "w-10 h-10", text: "text-[22px]", sub: "text-[12px]" },
    xl: { box: "w-12 h-12", text: "text-[26px]", sub: "text-[13px]" },
  };

  const s = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={easibieLogoImg}
        alt="Easibie Logo"
        className={`${s.box} rounded-[8px] object-cover shadow-xs border border-blue-600/30 shrink-0`}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-extrabold tracking-tight ${textColor}`}>
            Easibie
          </span>
          {showSubtitle && (
            <span className={`${s.sub} text-[#8A83AB] font-semibold tracking-wide uppercase mt-0.5`}>
              AI Virtual Try-On
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
