// pages/dashboard/payments/verify.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const SAMPLE_ORDER_ID_KEY = "leddar_sample_order_id";

export default function PaymentVerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [paymentType, setPaymentType] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const { reference } = router.query;

    if (!reference) {
      setStatus("error");
      setMessage("Payment reference is missing. Please contact support.");
      return;
    }

    const verify = async () => {
      try {
        const response = await axios.get(`${API_URL}/payments/verify`, {
          params: { reference },
        });

        const data = response.data.data;
        setPaymentType(data.paymentType || "");

        // Save orderId so SampleInfoPage can poll progress
        if (data.orderId && typeof window !== "undefined") {
          window.localStorage.setItem(SAMPLE_ORDER_ID_KEY, data.orderId);
        }

        setStatus("success");

        // Redirect based on payment type
        const redirectTo =
          data.paymentType === "PRODUCTION_BALANCE"
            ? "/order-tracker"
            : "/invoices";

        setTimeout(() => router.push(redirectTo), 2500);
      } catch (err) {
        const data = err.response?.data;
        const errMsg = data?.detail
          ? `${data.message} — ${data.detail}`
          : data?.message || "We could not verify your payment. Please contact support.";
        setMessage(errMsg);
        setStatus("error");
      }
    };

    verify();
  }, [router.isReady, router.query]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF6F1]">
      <div className="w-full max-w-md rounded-2xl border border-[#E6D7CB] bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" />
            <p className="text-base font-semibold text-ink">
              Verifying your payment...
            </p>
            <p className="text-sm text-[#5A4A44]">
              Please wait, do not close this page.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <p className="text-lg font-semibold text-ink">Payment Confirmed!</p>
            <p className="text-sm text-[#5A4A44]">
              {paymentType === "PRODUCTION_BALANCE"
                ? "Your production order has been placed. Redirecting to Order Tracker..."
                : "Your sample fee has been received. Redirecting you back..."}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="mx-auto h-14 w-14 text-[#B42318]" />
            <p className="text-lg font-semibold text-ink">
              Verification Failed
            </p>
            <p className="text-sm text-[#5A4A44]">{message}</p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => router.push("/new-order")}
                className="w-full rounded-xl bg-[#C49A3C] py-2.5 text-sm font-semibold text-white hover:bg-[#A8832F] transition-colors"
              >
                Start New Order
              </button>
              <button
                onClick={() => router.push("/sample-requests")}
                className="mt-1 text-sm font-medium text-[#8B6A39] underline underline-offset-2"
              >
                Return to Sample Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
