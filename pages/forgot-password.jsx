import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import axios from "axios"; // 1. Import axios
import Spinner from "../components/ui/Spinner";

// Get base URL from env or fallback
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      // 2. Call your actual backend endpoint
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      // 3. Set success message from backend
      setMessage(
        response.data.message ||
          "If this email is registered, a reset link has been sent.",
      );
      setEmail("");
    } catch (err) {
      // 4. Handle errors from backend
      const errorMessage =
        err.response?.data?.error ||
        "Unable to process your request right now. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-atmosphere min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/login"
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#D7CBC1] bg-white/80 px-3 py-2 text-sm font-medium text-[#5A4A44] transition hover:border-gold hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">
              Account Recovery
            </p>
            <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
              Forgot your password?
            </h1>
            <p className="mt-3 text-sm text-[#5A4A44] sm:text-base">
              Enter your registered email address and we will send a secure link
              to reset your password.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-[#E8DED5] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[#2D6A4F1A] p-1.5 text-success">
                    <MailCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Fast Reset</p>
                    <p className="mt-1 text-sm text-[#6A5B54]">
                      Most requests are delivered in under 2 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E8DED5] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[#C49A3C1A] p-1.5 text-gold">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Secure Link
                    </p>
                    <p className="mt-1 text-sm text-[#6A5B54]">
                      Reset links expire quickly for your account safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8DED5] bg-white p-6 shadow-lg sm:p-8">
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-[#5A4A44]">
              We will email instructions to reset your password.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input"
                  placeholder="you@brand.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leather px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5A2F22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Spinner
                      size="sm"
                      className="text-white border-white border-t-transparent"
                    />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            {message && (
              <p className="mt-4 rounded-lg border border-[#2D6A4F1A] bg-[#2D6A4F1A] px-4 py-3 text-sm text-success">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-lg border border-[#B423181A] bg-[#B4231812] px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <p className="mt-6 text-sm text-[#6A5B54]">
              Remembered your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-leather hover:underline"
              >
                Return to login.
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
