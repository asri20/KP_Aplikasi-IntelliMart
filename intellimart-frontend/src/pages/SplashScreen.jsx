
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ShoppingCart } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#102b61]">
      {/* Decorative shapes matching the IntelliMart branding */}
      <div className="absolute -left-32 -top-32 h-[430px] w-[430px] rounded-full bg-[#1d427d]/70" />
      <div className="absolute -bottom-44 -left-24 h-[410px] w-[760px] rotate-[22deg] rounded-[50%] bg-[#183b75]/80" />
      <div className="absolute -right-40 -bottom-44 h-[430px] w-[700px] rotate-[-18deg] rounded-[50%] bg-[#0b2858]/60" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative">
          <ShoppingCart
            size={88}
            strokeWidth={2.6}
            className="text-[#16e1d0]"
          />
          <div className="absolute -right-4 bottom-2 flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#16e1d0]" />
            <span className="h-3 w-3 rounded-full bg-[#16e1d0]" />
          </div>
        </div>

        <h1 className="mt-7 text-[50px] font-extrabold tracking-[-0.055em] text-white sm:text-[58px]">
          IntelliMart
        </h1>

        <p className="mt-1 text-base font-medium text-white/85">
          Smart Retail, Smarter Decisions
        </p>

        {/* Animated loading indicator from the first splash design */}
        <div className="mt-28 h-[5px] w-40 overflow-hidden rounded-full bg-[#21457f]">
          <div className="h-full w-16 animate-[splash-progress_2s_ease-in-out_forwards] rounded-full bg-[#16d9cf]" />
        </div>
      </div>

      <div className="absolute bottom-8 right-8 opacity-15">
        <BarChart3 size={250} className="text-[#167ca2]" strokeWidth={1.5} />
      </div>
    </main>
  );
}
