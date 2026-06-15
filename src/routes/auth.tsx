import { createFileRoute } from '@tanstack/react-router'
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"email" | { email: string }>("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    signIn("resend-otp", formData)
      .then(() => setStep({ email: formData.get("email") as string }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    signIn("resend-otp", formData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 md:p-12 border border-stone-100">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black italic">R</div>
            <span className="font-black text-stone-900 uppercase italic tracking-tighter">Rockhound</span>
          </Link>
          <h1 className="text-3xl font-black text-stone-900 uppercase italic tracking-tighter mb-2">
            {step === "email" ? "Join the Hunt" : "Check Your Inbox"}
          </h1>
          <p className="text-stone-500 font-medium">
            {step === "email" 
              ? "Sign in to access community features and tracking." 
              : `We sent a code to ${step.email}`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-4">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="hunter@geology.com"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold ml-4">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-stone-800 transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Get Sign-In Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input name="email" value={step.email} type="hidden" />
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-4">Verification Code</label>
              <input
                name="code"
                placeholder="123456"
                required
                autoFocus
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-black text-center text-2xl tracking-[0.5em]"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold ml-4">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
            <button 
              type="button" 
              onClick={() => setStep("email")}
              className="w-full text-stone-400 font-bold uppercase text-[10px] tracking-widest py-2 hover:text-stone-600"
            >
              Change Email
            </button>
          </form>
        )}

        <p className="mt-10 text-center text-[10px] text-stone-400 font-bold uppercase leading-relaxed px-6">
          By signing in, you agree to follow our stewardship guidelines and respect public lands.
        </p>
      </div>
    </div>
  )
}
