"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* Left Column - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111111] overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop"
            alt="Food background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 inline-block">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE13C] text-[#111111]">
              <span className="text-2xl font-black">F</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#FFE13C]">FoodDash</span>
          </Link>
          <div className="mt-6 inline-block border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium backdrop-blur-sm">
            Good Food • Fast Delivery • Better Life
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            Start Ordering Your<br />
            <span className="text-[#FFE13C]">Favorite Food</span>
          </h1>
          <p className="text-lg text-gray-300 font-medium leading-relaxed">
            Join FoodDash today and get access to the best restaurants in your city.
          </p>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 sm:p-10 border border-[#EAEAEA] shadow-sm my-auto">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE13C] text-[#111111]">
              <span className="text-xl font-black">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-[#111111]">FoodDash</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-[#111111] mb-2 tracking-tight">Create your account</h2>
            <p className="text-[#111111]/60 font-medium text-sm">Join FoodDash and start ordering.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#111111]">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full h-14 bg-white border border-[#E5E5E5] rounded-xl pl-11 pr-4 text-[#111111] text-sm font-medium focus:outline-none focus:border-[#FFE13C] focus:ring-1 focus:ring-[#FFE13C] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#111111]">Email address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                  className="w-full h-14 bg-white border border-[#E5E5E5] rounded-xl pl-11 pr-4 text-[#111111] text-sm font-medium focus:outline-none focus:border-[#FFE13C] focus:ring-1 focus:ring-[#FFE13C] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#111111]">Phone Number (Optional)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 890"
                  className="w-full h-14 bg-white border border-[#E5E5E5] rounded-xl pl-11 pr-4 text-[#111111] text-sm font-medium focus:outline-none focus:border-[#FFE13C] focus:ring-1 focus:ring-[#FFE13C] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#111111]">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-14 bg-white border border-[#E5E5E5] rounded-xl pl-11 pr-12 text-[#111111] text-sm font-medium focus:outline-none focus:border-[#FFE13C] focus:ring-1 focus:ring-[#FFE13C] transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#FFE13C] hover:bg-[#F0D32C] text-[#111111] rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> 
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#111111] font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
