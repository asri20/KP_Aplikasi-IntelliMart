import { BarChart3, ShoppingCart } from "lucide-react";

export default function AuthShell({ children, topRight }) {
  return (
    <main className="min-h-screen bg-white lg:flex">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#132d63] lg:flex lg:w-1/2 items-center justify-center">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[#244985]/70" />
        <div className="absolute -bottom-36 -left-24 h-80 w-[560px] rotate-[23deg] rounded-[50%] bg-[#1d427f]/80" />
        <div className="absolute bottom-4 right-8 opacity-20">
          <BarChart3 size={230} className="text-[#0a6094]" strokeWidth={1.4} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <ShoppingCart size={64} strokeWidth={2.7} className="text-[#19e3d2]" />
          <div className="mt-3 text-[44px] font-extrabold tracking-[-0.055em] text-white">
            Intelli<span className="text-[#1ac2bd]">Mart</span>
          </div>
          <p className="mt-[-4px] text-sm font-medium text-white/80">
            Smart Retail, Smarter Decisions
          </p>
        </div>
      </aside>

      <section className="relative flex min-h-screen w-full flex-col overflow-hidden lg:w-1/2">
        <div className="absolute right-0 bottom-0 h-72 w-72 translate-x-28 translate-y-28 rounded-full bg-[#effafa]" />
        <div className="relative z-10 flex justify-end px-8 pt-6 text-xs text-[#8190aa]">
          {topRight}
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center px-7 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-[560px]">{children}</div>
        </div>
      </section>
    </main>
  );
}
