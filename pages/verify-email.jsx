"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail, ArrowRight, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("The verification link is missing or invalid.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`,
          { method: "GET" },
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Verification failed");

        setStatus("success");
        setMessage(
          data.message || "Your email has been successfully verified.",
        );

        // Optional: Auto redirect to login after 5 seconds
        setTimeout(() => router.push("/login"), 5000);
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-atmosphere flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-[#E8DED5] p-8 md:p-10 text-center transition-all duration-500 animate-in fade-in zoom-in-95">
          {/* Icon Header */}
          <div className="mb-8 flex justify-center">
            {status === "loading" && (
              <div className="relative">
                <div className="w-20 h-20 bg-leather/5 rounded-full flex items-center justify-center text-leather">
                  <Mail className="w-10 h-10 animate-pulse" />
                </div>
                <Loader2
                  className="w-20 h-20 text-gold absolute top-0 left-0 animate-spin opacity-30"
                  strokeWidth={1}
                />
              </div>
            )}

            {status === "success" && (
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 scale-110 transition-transform duration-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            )}

            {status === "error" && (
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <XCircle className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-ink tracking-tight">
              {status === "loading" && "Verifying Email"}
              {status === "success" && "Verified!"}
              {status === "error" && "Oops!"}
            </h1>

            <p className="text-[#6A5B54] text-lg leading-relaxed">
              {status === "loading" &&
                "Give us a moment while we validate your credentials..."}
              {status === "success" && message}
              {status === "error" &&
                (message || "This link may have expired or is already used.")}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-10">
            {status === "success" ? (
              <Link
                href="/login"
                className="group w-full h-14 inline-flex items-center justify-center gap-2 rounded-xl bg-leather px-6 text-base font-bold text-white transition-all hover:bg-[#5A2F22] hover:shadow-lg active:scale-95"
              >
                Continue to Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : status === "error" ? (
              <Link
                href="/login"
                className="inline-block text-leather font-semibold border-b-2 border-transparent hover:border-leather transition-all"
              >
                Back to Login
              </Link>
            ) : (
              <div className="h-14 flex items-center justify-center">
                <p className="text-sm text-[#A39289] font-medium italic">
                  Establishing secure connection...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer branding */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#A39289] font-medium">
            &copy; {new Date().getFullYear()} Leddar Administration Panel
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for Next.js 13/14/15 searchParams requirements
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-atmosphere flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-leather" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}