import { CircleCheckBig } from "lucide-react";

export default function SignupConfirmation() {
  return (
    <div className="bg-atmosphere flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-lg p-10 text-center">
        <CircleCheckBig className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">
          Request Submitted.
        </h1>
        <p className="mt-3 text-sm text-[#5B4C45]">
          Thank you. Your access request has been received. Our team will review
          your details and contact you within 24-48 hours.
        </p>
      </div>
    </div>
  );
}
