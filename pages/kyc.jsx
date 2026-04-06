import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { CircleCheckBig } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import {
  getKycProfile,
  retryKycVerification,
  startKycVerification,
  verifyKycIdentity,
} from "../services/authService";

export default function KycPage() {
  const router = useRouter();
  const [kycProfile, setKycProfile] = useState(getKycProfile());
  const [busy, setBusy] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [idType, setIdType] = useState("NIN");
  const [idNumber, setIdNumber] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const returnUrl =
    typeof router.query.returnUrl === "string" && router.query.returnUrl
      ? router.query.returnUrl
      : "/dashboard";

  const statusCopy = useMemo(() => {
    switch (kycProfile.status) {
      case "in_progress":
        return {
          badge: "In Progress",
          title: "KYC started with third-party provider",
          note: "Complete identity verification in the form below.",
        };
      case "pending_review":
        return {
          badge: "Pending",
          title: "KYC under review",
          note: "Our compliance team is reviewing your submitted information.",
        };
      case "verified":
        return {
          badge: "Verified",
          title: "KYC verified successfully",
          note: "You can now access pricing deposits and payment actions.",
        };
      case "rejected":
        return {
          badge: "Rejected",
          title: "KYC was rejected",
          note:
            kycProfile.rejectionReason ||
            "Please review your documents and retry verification.",
        };
      default:
        return {
          badge: "Not Started",
          title: "KYC required",
          note: "Complete KYC once to unlock quote deposits, sample fee payments, and balance checkout.",
        };
    }
  }, [kycProfile]);

  const showVerificationAction =
    kycProfile.status === "not_started" || kycProfile.status === "in_progress";
  const verificationActionLabel =
    kycProfile.status === "in_progress"
      ? "Continue Verification"
      : "Start KYC Verification";

  function updateProfile(nextProfile) {
    setKycProfile(nextProfile);
  }

  function handleOpenVerifyModal() {
    setVerifyError("");
    setVerifyModalOpen(true);
  }

  async function handleSubmitVerification(event) {
    event.preventDefault();

    setVerifyError("");
    setBusy(true);
    try {
      if (
        kycProfile.status === "not_started" ||
        kycProfile.status === "rejected"
      ) {
        updateProfile(startKycVerification());
      }

      const verifiedProfile = await verifyKycIdentity({
        idType,
        idNumber,
      });

      updateProfile(verifiedProfile);
      setVerifyModalOpen(false);
      setIdNumber("");
      router.push(returnUrl);
    } catch (verificationError) {
      setVerifyError(
        verificationError.message || "Unable to verify identity right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRetry() {
    setBusy(true);
    try {
      updateProfile(retryKycVerification());
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageWrapper>
      <div className="rounded-xl border border-[#E6D7CB] bg-[#FFF6E8] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#7A4A16]">
              {statusCopy.title}
            </p>
            <p className="mt-1 text-sm text-[#5A4A44]">{statusCopy.note}</p>
          </div>
          <Badge status={statusCopy.badge} />
        </div>
      </div>

      <div className="card mt-6 max-w-2xl p-6">
        <h1 className="page-title">KYC Verification</h1>
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-[#E8DED5] bg-white p-4">
            <p className="text-sm font-semibold text-ink">Status</p>
            <p className="mt-1 text-sm text-[#5A4A44]">
              Current state: {kycProfile.status}
            </p>
          </div>

          {showVerificationAction ? (
            <div className="rounded-xl border border-[#E8DED5] bg-white p-4">
              <p className="text-sm text-[#5A4A44]">
                Start verification only when you are ready to proceed with quote
                deposits or payments.
              </p>
              <Button
                variant="accent"
                className="mt-3"
                onClick={handleOpenVerifyModal}
                disabled={busy}
              >
                {verificationActionLabel}
              </Button>
            </div>
          ) : null}

          {kycProfile.status === "pending_review" ? (
            <div className="rounded-xl border border-[#E8DED5] bg-white p-4">
              <p className="text-sm text-[#5A4A44]">
                Your KYC is pending manual review.
              </p>
            </div>
          ) : null}

          {kycProfile.status === "verified" ? (
            <div className="rounded-xl border border-[#2D6A4F1A] bg-[#2D6A4F10] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                <CircleCheckBig className="h-4 w-4" />
                KYC completed successfully.
              </p>
              <div className="mt-3">
                <Button variant="accent" onClick={() => router.push(returnUrl)}>
                  Continue
                </Button>
              </div>
            </div>
          ) : null}

          {kycProfile.status === "rejected" ? (
            <div className="rounded-xl border border-[#B423181A] bg-[#B4231812] p-4">
              <p className="text-sm font-semibold text-[#B42318]">
                Verification was rejected.
              </p>
              <p className="mt-1 text-sm text-[#5A4A44]">{statusCopy.note}</p>
              <div className="mt-3">
                <Button variant="outline" onClick={handleRetry} disabled={busy}>
                  Retry KYC
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-[#6A5B54]">
          Leddar does not store your identity documents. Verification is powered
          by VerifyMe.ng.
        </p>
      </div>

      <Modal
        open={verifyModalOpen}
        title="Verify Identity"
        onClose={() => setVerifyModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmitVerification}>
          <p className="text-sm text-[#5A4A44]">
            Enter your ID details below. Verification is processed via VerifyMe
            API.
          </p>

          <div>
            <label className="label">ID Type</label>
            <select
              className="input"
              value={idType}
              onChange={(event) => setIdType(event.target.value)}
              required
            >
              <option value="NIN">NIN</option>
              <option value="CAC">CAC</option>
              <option value="Voters Card">Voter&apos;s Card</option>
            </select>
          </div>

          <div>
            <label className="label">ID Number</label>
            <input
              className="input"
              value={idNumber}
              onChange={(event) => setIdNumber(event.target.value)}
              placeholder="Enter your ID number"
              required
            />
          </div>

          {verifyError ? (
            <p className="text-sm text-[#B42318]">{verifyError}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" variant="accent" disabled={busy}>
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" className="text-espresso" />
                  <span>Verifying...</span>
                </span>
              ) : (
                "Verify with VerifyMe"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVerifyModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
