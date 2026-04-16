"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No token provided.");
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
        setMessage(data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verify();
  }, [token]);

  return (
    <div style={styles.container}>
      {status === "loading" && <p>Verifying your email...</p>}

      {status === "success" && (
        <div style={styles.box}>
          <h2 style={{ color: "#000" }}>✅ Email Verified</h2>
          <p>{message}</p>
          <a href="/login" style={styles.button}>
            Go to Login
          </a>
        </div>
      )}

      {status === "error" && (
        <div style={styles.box}>
          <h2 style={{ color: "red" }}>❌ Verification Failed</h2>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
  },
  box: {
    textAlign: "center",
    padding: "40px",
    border: "1px solid #eee",
    borderRadius: "12px",
    maxWidth: "400px",
    width: "100%",
  },
  button: {
    display: "inline-block",
    marginTop: "16px",
    padding: "12px 24px",
    backgroundColor: "#000",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "bold",
  },
};
