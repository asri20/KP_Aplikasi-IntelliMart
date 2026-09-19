import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { getSession, login } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) navigate("/dashboard/owner", { replace: true });
  }, [navigate]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ identity, password });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      const from = location.state?.from;
      const destination =
        from ||
        (result.session.role === "OWNER"
          ? "/dashboard/owner"
          : "/login");

      navigate(destination, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      topRight={
        <>
          POS &amp; Inventory Management
          <span className="ml-2 inline-block h-px w-7 bg-[#aab8cb]" />
        </>
      }
    >
      <div className="mb-8">
        <div className="mb-6 h-1 w-12 rounded-full bg-[#16b8b8]" />
        <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#132d63]">
          Welcome Back to
          <span className="block text-[#19aaa9]">IntelliMart</span>
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-[#536987]">
          Sign in to your account to manage your store, inventory, and sales — all in one place.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="relative">
          <UserRound className="absolute left-5 top-1/2 -translate-y-1/2 text-[#627795]" size={20} />
          <input
            required
            value={identity}
            onChange={e => setIdentity(e.target.value)}
            placeholder="Email/Username"
            className="auth-input pl-16 pr-5"
          />
        </div>

        <div className="relative">
          <LockKeyhole className="absolute left-5 top-1/2 -translate-y-1/2 text-[#627795]" size={20} />
          <input
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Password"
            className="auth-input pl-16 pr-14"
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#627795]"
            aria-label="Toggle password visibility"
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#19b6b4] font-bold text-white shadow-[0_12px_28px_rgba(25,182,180,.18)] transition hover:bg-[#14a6a5] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : <>Login <ArrowRight size={21} /></>}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button type="button" className="text-sm font-semibold text-[#0ca7a8]">
          Forgot Password?
        </button>
      </div>

      <p className="mt-7 text-center text-xs text-[#8e9cb1]">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-bold text-[#0ca7a8]">
          Register here
        </Link>
      </p>

      <div className="mt-6 rounded-xl bg-[#f6f9fc] p-3 text-center text-[11px] text-[#71839e]">
        Demo login: <b>owner@intellimart.local</b> / <b>owner123</b>
      </div>
    </AuthShell>
  );
}
