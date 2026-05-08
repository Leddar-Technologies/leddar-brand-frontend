import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CircleCheckBig } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import {
  getKycStatus,
  retryKycVerification,
  startKycVerification,
  verifyKycIdentity,
} from "../services/authService";

export default function KycPage() {
  const router = useRouter();

  // Initialize with a default object to prevent 'undefined' errors on first render
  const [kycProfile, setKycProfile] = useState({
    status: "not_started",
    rejectionReason: "",
    firstname: "",
    lastname: "",
    businessName: "",
  });

  const [busy, setBusy] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [idType, setIdType] = useState("NIN");
  const [idNumber, setIdNumber] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const returnUrl =
    typeof router.query.returnUrl === "string" && router.query.returnUrl
      ? router.query.returnUrl
      : "/dashboard";

  // Fetch the actual status from the backend on component mount
  useEffect(() => {
    async function loadStatus() {
      try {
        const profile = await getKycStatus();
        setKycProfile(profile);
      } catch (error) {
        console.error("Failed to load KYC status:", error);
      } finally {
        setBusy(false);
      }
    }
    loadStatus();
  }, []);

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

  function handleOpenVerifyModal() {
    setVerifyError("");
    setVerifyModalOpen(true);
  }

  async function handleSubmitVerification(event) {
    event.preventDefault();
    setVerifyError("");
    setBusy(true);

    try {
      // Update status to 'in_progress' if starting fresh
      if (
        kycProfile.status === "not_started" ||
        kycProfile.status === "rejected"
      ) {
        const initialProfile = await startKycVerification();
        setKycProfile(initialProfile);
      }

      // Call the identity verification service with ID details
      const verifiedProfile = await verifyKycIdentity({
        idType,
        idNumber,
        firstname: kycProfile.firstname || "",
        lastname: kycProfile.lastname || "",
        businessName: kycProfile.businessName || "",
      });

      setKycProfile(verifiedProfile);
      setVerifyModalOpen(false);
      setIdNumber("");

      // Automatically redirect if the provider returns 'verified' immediately
      if (verifiedProfile.status === "verified") {
        router.push(returnUrl);
      }
    } catch (err) {
      setVerifyError(err.message || "Unable to verify identity right now.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRetry() {
    setBusy(true);
    try {
      const nextProfile = await retryKycVerification();
      setKycProfile(nextProfile);
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageWrapper>
      {/* Status Banner */}
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

          {showVerificationAction && (
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
          )}

          {kycProfile.status === "pending_review" && (
            <div className="rounded-xl border border-[#E8DED5] bg-white p-4">
              <p className="text-sm text-[#5A4A44]">
                Your KYC is pending manual review.
              </p>
            </div>
          )}

          {kycProfile.status === "verified" && (
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
          )}

          {kycProfile.status === "rejected" && (
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
          )}
        </div>

        <p className="mt-6 text-xs text-[#6A5B54]">
          Leddar does not store your identity documents. Verification is powered
          by VerifyMe.ng.
        </p>
      </div>

      {/* KYC Entry Modal */}
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

          {verifyError && (
            <p className="text-sm text-[#B42318]">{verifyError}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" variant="accent" disabled={busy}>
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" />
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
