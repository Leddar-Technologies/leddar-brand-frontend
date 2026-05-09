"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
  Loader2,
  Terminal,
} from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Secret toggle: append ?debug=true to your URL in production to see the panel
  const isDebugMode = searchParams.get("debug") === "true";

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (!token) {
      console.log("[VerifyEmail] Waiting for token...");
      return;
    }

    const verify = async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`;

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        // Capture data for the debug panel
        setDebugInfo({
          url,
          status: res.status,
          ok: res.ok,
          data,
        });

        if (!res.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setStatus("success");
        setMessage(
          data.message || "Your email has been successfully verified.",
        );

        // Auto-redirect after success
        setTimeout(() => router.push("/login"), 5000);
      } catch (err) {
        console.error("[VerifyEmail] Caught error:", err);
        setStatus("error");
        setMessage(err.message);

        // Ensure debug info captures the failure even if res.json() failed
        setDebugInfo((prev) => ({
          ...prev,
          error: err.message,
          timestamp: new Date().toLocaleTimeString(),
        }));
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-atmosphere flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#E8DED5] p-8 md:p-10 text-center transition-all duration-500 animate-in fade-in zoom-in-95">
          {/* Status Icon Section */}
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

          {/* Text Content */}
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

          {/* 
              DEBUG PANEL 
              Visible if: 
              1. Local development environment
              2. URL has ?debug=true 
          */}
          {(process.env.NODE_ENV === "development" || isDebugMode) && (
            <div className="mt-8 text-left bg-gray-900 text-green-400 rounded-xl p-5 shadow-inner ring-1 ring-white/10">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                <Terminal size={14} className="text-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  System Diagnostics {isDebugMode && "(Live Override)"}
                </span>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <p>
                  <span className="text-yellow-500/80">ENDPOINT:</span>{" "}
                  {process.env.NEXT_PUBLIC_API_URL || "NOT_SET"}
                </p>
                <p>
                  <span className="text-yellow-500/80">TOKEN:</span>{" "}
                  {token ? `${token.substring(0, 10)}...` : "MISSING"}
                </p>
                <p>
                  <span className="text-yellow-500/80">HTTP_STATUS:</span>{" "}
                  {debugInfo?.status || "N/A"}
                </p>

                {debugInfo?.data && (
                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <p className="text-blue-400 mb-1">RAW_RESPONSE:</p>
                    <pre className="bg-black/40 p-2 rounded overflow-x-auto whitespace-pre">
                      {JSON.stringify(debugInfo.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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

        <div className="mt-8 text-center">
          <p className="text-sm text-[#A39289] font-medium">
            &copy; {new Date().getFullYear()} Leddar Administration Panel
          </p>
        </div>
      </div>
    </div>
  );
}

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
