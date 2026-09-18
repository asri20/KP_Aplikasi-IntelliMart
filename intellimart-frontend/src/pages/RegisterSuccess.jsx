import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

export default function RegisterSuccess() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#102b61]">
      <div className="absolute left-7 top-5"><BrandLogo compact /></div>
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#1d427c]/70" />
      <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#173d77]/70" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#0b234f]/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <section className="w-full max-w-[480px] rounded-2xl border border-white/30 bg-white px-9 py-10 text-center shadow-2xl">
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#e7faf2]">
            <div className="absolute inset-2 rounded-full bg-[#c9f5e7]" />
            <CheckCircle2 size={70} strokeWidth={2.2} className="relative z-10 text-[#08bd80]" />
            <Sparkles className="absolute -right-2 -top-2 text-[#19b6b4]" size={24} />
          </div>

          <h1 className="mt-7 text-[30px] font-extrabold leading-tight text-[#132d63]">
            Registration<br />
            <span className="text-[#12b5b2]">Successful!</span>
          </h1>

          <p className="mt-3 text-sm text-[#566b8d]">
            Your Owner account has been created.
          </p>

          <Link
            to="/login"
            className="mt-7 flex h-14 items-center justify-center gap-2 rounded-xl bg-[#19b6b4] font-bold text-white shadow-[0_10px_25px_rgba(25,182,180,.2)]"
          >
            <ArrowRight size={18} /> Proceed to Login
          </Link>
        </section>
      </div>
    </main>
  );
}
