"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Phone, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to login");
      }

      const userRole = data.user?.role;
      if (userRole === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else if (userRole === "RESTAURANT_ADMIN" || userRole === "STAFF") {
        router.push("/admin");
      } else if (userRole === "DELIVERY_PARTNER") {
        router.push("/delivery");
      } else {
        router.push("/");
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFE13C] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-400/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex w-14 h-14 bg-black rounded-2xl items-center justify-center text-zinc-900 text-2xl mx-auto mb-6 shadow-lg hover:scale-105 transition-transform">
            🍴
          </Link>
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm font-medium text-zinc-500">Sign in to your FoodHub account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-black ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full h-14 bg-zinc-50 border-2 border-transparent rounded-2xl pl-11 pr-4 text-black text-sm font-medium focus:outline-none focus:border-[#FFD83D] focus:bg-white transition-all placeholder:text-zinc-500 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-bold text-black">Password</label>
              <Link href="#" className="text-xs font-bold text-black opacity-60 hover:opacity-100 transition-opacity">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 bg-zinc-50 border-2 border-transparent rounded-2xl pl-11 pr-4 text-black text-sm font-medium focus:outline-none focus:border-[#FFD83D] focus:bg-white transition-all placeholder:text-zinc-500 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-black hover:bg-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-zinc-100"></div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Or continue with</span>
          <div className="flex-1 h-px bg-zinc-100"></div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="h-14 flex items-center justify-center gap-2 bg-white border-2 border-zinc-100 rounded-2xl hover:border-zinc-300 hover:bg-zinc-50 transition-all text-sm font-bold text-black shadow-sm">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Google
          </button>
          <button className="h-14 flex items-center justify-center gap-2 bg-white border-2 border-zinc-100 rounded-2xl hover:border-zinc-300 hover:bg-zinc-50 transition-all text-sm font-bold text-black shadow-sm">
            <Phone size={18} className="text-black" />
            OTP
          </button>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-zinc-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-black font-bold hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
