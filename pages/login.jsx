import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff, Lock, Mail, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { getSession, login } from "../services/authService";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      // 2. Perform Backend Authentication
      // This service should save the token to localStorage/Cookies
      const response = await login({ email, password, role: "BRAND" });

      if (response) {
        setStatus("success");

        // 3. Brief delay to ensure storage is synced and show success UI
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "Invalid credentials. Please try again.");
    }
  }

  return (
    <div className="bg-atmosphere flex min-h-screen items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className={`bg-white rounded-2xl border border-[#E8DED5] p-8 shadow-xl transition-all duration-300 ${status === "success" ? "opacity-90 scale-95" : "opacity-100"}`}
        >
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/leddar-logo.svg"
              alt="Leddar"
              width={160}
              height={50}
              className="h-12 w-auto mb-4"
              priority
            />
            <h2 className="text-2xl font-bold text-ink">Welcome Back</h2>
            <p className="text-sm text-[#6A5B54] mt-1">
              Access your manufacturing portal
            </p>
          </div>

          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#3C2F2A]">
                Official Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7F7068]"
                  size={18}
                />
                <input
                  type="email"
                  disabled={status === "loading" || status === "success"}
                  className="w-full rounded-lg border border-[#D7CBC1] bg-white pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold transition disabled:bg-gray-50"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-[#3C2F2A]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-leather hover:text-gold transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7F7068]"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={status === "loading" || status === "success"}
                  className="w-full rounded-lg border border-[#D7CBC1] bg-white pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-gold transition disabled:bg-gray-50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F7068] hover:text-gold transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {status === "error" && (
              <div className="bg-red-50 border border-red-100 text-[#B42318] text-sm p-3 rounded-lg text-center font-medium animate-shake">
                {error}
              </div>
            )}

            {/* Success Message */}
            {status === "success" && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm p-3 rounded-lg text-center font-medium flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                Authenticated. Redirecting...
              </div>
            )}

            <Button
              className={`w-full py-4 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98] ${status === "success" ? "bg-green-600" : "bg-leather hover:bg-[#5A2F22]"}`}
              type="submit"
              disabled={status === "loading" || status === "success"}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  <span className="uppercase tracking-widest text-xs">
                    Authenticating...
                  </span>
                </span>
              ) : status === "success" ? (
                <span className="uppercase tracking-widest text-xs">
                  Success
                </span>
              ) : (
                <span className="uppercase tracking-widest text-xs">
                  Sign In
                </span>
              )}
            </Button>

            <div className="pt-6 border-t border-[#E8DED5] text-center">
              <p className="text-sm text-[#5A4B44]">
                Need access?{" "}
                <Link
                  href="/signup"
                  className="text-leather font-bold border-b border-leather hover:text-gold hover:border-gold transition"
                >
                  Request here
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
