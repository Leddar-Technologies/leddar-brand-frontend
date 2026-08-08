"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/router"; // Using next/router for Pages directory
import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import Spinner from "../components/ui/Spinner";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.myleddar.com/api/v1";

function ResetPasswordContent() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const isLengthValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password !== "";

  // DEBUG & INITIAL VALIDATION
  useEffect(() => {
    if (router.isReady) {
      console.log("--- FRONTEND DEBUG ---");
      console.log("Token from URL:", token);

      // Only set "Missing Token" error if we aren't already successful
      if (!token && status !== "success") {
        console.warn("DEBUG: No token found. Setting error state.");
        setStatus("error");
        setErrorMessage(
          "Invalid or missing reset token. Please request a new link.",
        );
      }
    }
  }, [router.isReady, token, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLengthValid || !passwordsMatch) return;

    console.log("--- FRONTEND DEBUG: handleSubmit ---");
    setErrorMessage("");
    setStatus("loading");

    try {
      const response = await axios.post(
        `${API_URL}/auth/reset-password?token=${token}`,
        { password },
      );

      console.log("DEBUG: Reset Successful:", response.data);
      setStatus("success");

      // Wait 3 seconds so user can see the success message before redirect
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("DEBUG: Reset Failed", err);

      // IMPORTANT: If backend logs show success, ignore errors triggered by token deletion
      if (status !== "success") {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.error ||
            "Failed to reset password. The link may have expired.",
        );
      }
    }
  };

  if (status === "success") {
    return (
      <div className="bg-atmosphere min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300 bg-white rounded-2xl shadow-xl">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Password Updated!</h1>
          <p className="mt-3 text-[#6A5B54]">
            Your password has been changed. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-atmosphere min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="mx-auto w-full max-w-[480px]">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-[#D7CBC1] bg-white/80 px-4 py-2 text-sm font-medium text-[#5A4A44] transition hover:text-leather"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="card shadow-2xl p-8 sm:p-10 bg-white rounded-2xl border border-[#E8DED5]">
          <header className="mb-8">
            <div className="w-12 h-12 bg-leather/10 rounded-xl flex items-center justify-center text-leather mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-ink">Set New Password</h1>
            <p className="mt-2 text-sm text-[#6A5B54]">
              Choose a strong password with at least 8 characters.
            </p>
          </header>

          {/* Logic: Only show error if status is 'error' and we haven't succeeded */}
          {status === "error" && errorMessage && status !== "success" && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full p-3 border border-[#D7CBC1] rounded-lg focus:ring-2 focus:ring-leather outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A39289] hover:text-leather"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input w-full p-3 border rounded-lg focus:ring-2 outline-none ${
                  confirmPassword && !passwordsMatch
                    ? "border-red-500 focus:ring-red-200"
                    : "border-[#D7CBC1] focus:ring-leather"
                }`}
                placeholder="••••••••"
                required
              />
            </div>

            <ul className="space-y-2 py-2">
              <li
                className={`flex items-center gap-2 text-xs font-medium ${isLengthValid ? "text-green-600" : "text-gray-400"}`}
              >
                <CheckCircle2 className="w-4 h-4" /> At least 8 characters
              </li>
              <li
                className={`flex items-center gap-2 text-xs font-medium ${passwordsMatch ? "text-green-600" : "text-gray-400"}`}
              >
                <CheckCircle2 className="w-4 h-4" /> Passwords match
              </li>
            </ul>

            <button
              type="submit"
              disabled={
                status === "loading" || !isLengthValid || !passwordsMatch
              }
              className="w-full h-12 bg-leather text-white font-bold rounded-xl transition hover:bg-[#5A2F22] disabled:opacity-50"
            >
              {status === "loading" ? <Spinner size="sm" /> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-atmosphere">
          <Spinner />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
