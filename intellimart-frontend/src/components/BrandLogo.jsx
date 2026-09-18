import { ShoppingCart } from "lucide-react";

export default function BrandLogo({ compact = false }) {
  return (
    <div className={`flex items-center ${compact ? "gap-2" : "flex-col gap-3"}`}>
      <ShoppingCart
        size={compact ? 34 : 62}
        strokeWidth={2.7}
        className="text-[#19e3d2]"
      />
      <div className={`${compact ? "text-xl" : "text-[43px]"} font-extrabold tracking-[-0.055em] text-white`}>
        Intelli<span className="text-[#1ac2bd]">Mart</span>
      </div>
      {!compact && (
        <p className="-mt-2 text-sm font-medium text-white/80">
          Smart Retail, Smarter Decisions
        </p>
      )}
    </div>
  );
}
