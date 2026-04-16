import { useRouter } from "next/router";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { setLastBrandName } from "../services/authService";

export default function SignupConfirmation() {
  const router = useRouter();
  const contactName =
    typeof router.query.contactName === "string" && router.query.contactName
      ? router.query.contactName
      : "Partner";

  function handleApproval() {
    const approvedBusinessName =
      typeof router.query.businessName === "string" && router.query.businessName
        ? router.query.businessName
        : "New Partner";

    if (typeof window !== "undefined") {
      const session = {
        token: "mock-leddar-token",
        email: "pending@leddar.example",
        businessName: approvedBusinessName,
      };
      window.localStorage.setItem("leddar_session", JSON.stringify(session));
    }

    setLastBrandName(approvedBusinessName);

    setTimeout(() => {
      router.push("/dashboard");
    }, 100);
  }

  return (
    <div className="bg-atmosphere flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-[#E8DED5] bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2D6A4F1A]">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-ink">
            You're in, we've received your request
          </h1>
          <p className="text-[#5A4A44]">
            {contactName}, your request has been successfully submitted. We’re
            reviewing your production needs and preparing the best match for
            you.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-[#E8DED5] bg-[#F4EEE9] p-6">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Clock className="h-5 w-5 text-gold" />
            <span className="font-medium text-ink">What Happens Next?</span>
          </div>
          <div className="space-y-3 text-sm text-[#5A4A44]">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-gold" />
              <span>We review your request within 24–48 hours</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-gold" />
              <span>
                We match you with verified artisans suited to your needs
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-gold" />
              <span>
                You receive access to your production dashboard
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-gold" />
              <span>
                You’ll be notified as soon as your account is ready.
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2 text-[#7F7068]">
          <Mail className="h-4 w-4" />
          <span className="text-sm">Check your email for updates and next steps</span>
        </div>

        <button
          onClick={handleApproval}
          className="w-full rounded-lg bg-leather px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#5A2F22]"
        >
          Go to Dashboard
        </button>
        <p className="mt-2 text-xs text-[#8A7A72]">
          Need help? Contact support <a href="mailto:support@leddar.com" className="text-gold underline">
            support@leddar.com
          </a>

        </p>
      </div>
    </div>
  );
}
