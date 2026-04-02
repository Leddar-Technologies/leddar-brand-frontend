import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "../components/ui/Button";
import { getSession, login } from "../services/authService";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-atmosphere flex min-h-screen items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-8">
        <h1 className="text-center text-3xl font-bold tracking-[0.2em] text-leather">
          LEDDAR
        </h1>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </Button>
          <a href="#" className="block text-sm text-gold hover:underline">
            Forgot password?
          </a>
          <p className="text-sm text-[#5A4B44]">
            Need access?{" "}
            <Link
              href="/signup"
              className="text-leather font-semibold hover:underline"
            >
              Request here.
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
