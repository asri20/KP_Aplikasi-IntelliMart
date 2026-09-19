import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { registerOwner } from "../services/auth";

export default function Register() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerOwner({ fullName, email, password });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      navigate("/register/success", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      topRight={
        <>
          Already have an account?
          <Link to="/login" className="ml-1 font-bold text-[#0ca7a8]">Login here</Link>
        </>
      }
    >
      <div className="mb-7">
        <div className="mb-4 h-1 w-12 rounded-full bg-[#16b8b8]" />
        <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#132d63]">
          Create Your
          <span className="block text-[#19aaa9]">IntelliMart Account</span>
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[#536987]">
          Join IntelliMart and start managing your store, inventory, and sales — all in one place.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-[#d9efed] bg-[#f3fbfa] px-4 py-3 text-xs leading-5 text-[#4f7180]">
        The first public registration creates an <b className="text-[#0b9998]">Owner</b> account.
        Managers can be added later by the Owner.
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-3.5">
        <div className="relative">
          <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7c97]" size={18} />
          <input
            required value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Full Name" className="auth-input pl-12 pr-4"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7c97]" size={18} />
          <input
            required type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email Address" className="auth-input pl-12 pr-4"
          />
        </div>

        <div className="relative">
          <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7c97]" size={18} />
          <input
            required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            type={show ? "text" : "password"} placeholder="Password"
            className="auth-input pl-12 pr-12"
          />
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a7c97]">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a7c97]" size={18} />
          <input
            required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            type={confirm ? "text" : "password"} placeholder="Confirm Password"
            className="auth-input pl-12 pr-12"
          />
          <button type="button" onClick={() => setConfirm(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a7c97]">
            {confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="mt-1 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-[#19b6b4] text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(25,182,180,.17)] hover:bg-[#14a6a5] disabled:opacity-70"
        >
          {loading ? "Creating account..." : <>Register <ArrowRight size={19} /></>}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-[#8e9cb1]">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-[#0ca7a8]">Login here</Link>
      </p>
    </AuthShell>
  );
}
