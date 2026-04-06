import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CircleCheckBig,
  CreditCard,
  FileUp,
  FlaskConical,
  HandCoins,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/router";
import { productTypes } from "../../data/mockData";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import {
  confirmPricingDepositPayment,
  getPricingRequestStatus,
  initializePricingDepositPayment,
} from "../../services/prototypeService";
import { getKycStatus } from "../../services/authService";

const PENDING_QUOTE_REQUEST_KEY = "leddar_pending_quote_request_id";
const PENDING_QUOTE_INTENT_KEY = "leddar_pending_quote_intent";

export default function QuoteForm() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(100);
  const [productType, setProductType] = useState(productTypes[0]);
  const [requiredTimeline, setRequiredTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [pricingError, setPricingError] = useState("");
  const [pricingPending, setPricingPending] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositInitializing, setDepositInitializing] = useState(false);
  const [depositConfirming, setDepositConfirming] = useState(false);
  const [depositDetails, setDepositDetails] = useState(null);
  const [requestId, setRequestId] = useState("");
  const fileInputRef = useRef(null);
  const pollingBusyRef = useRef(false);

  function savePendingRequestId(id) {
    if (typeof window === "undefined" || !id) {
      return;
    }
    window.localStorage.setItem(PENDING_QUOTE_REQUEST_KEY, id);
  }

  function savePendingQuoteIntent(intent) {
    if (typeof window === "undefined" || !intent) {
      return;
    }
    window.sessionStorage.setItem(
      PENDING_QUOTE_INTENT_KEY,
      JSON.stringify(intent),
    );
  }

  function readPendingQuoteIntent() {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = window.sessionStorage.getItem(PENDING_QUOTE_INTENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clearPendingQuoteIntent() {
    if (typeof window === "undefined") {
      return;
    }
    window.sessionStorage.removeItem(PENDING_QUOTE_INTENT_KEY);
  }

  function clearPendingRequestId() {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem(PENDING_QUOTE_REQUEST_KEY);
  }

  function validateRequestInputs() {
    if (!quantity || Number(quantity) <= 0) {
      setPricingError(
        "Please provide a valid quantity before requesting pricing.",
      );
      return false;
    }

    if (files.length === 0) {
      setPricingError("Please upload at least one product spec file.");
      return false;
    }

    if (!requiredTimeline) {
      setPricingError("Please select a required timeline.");
      return false;
    }

    return true;
  }

  function buildQuoteRequestPayload() {
    return {
      productType,
      quantity: Number(quantity),
      requiredTimeline,
      notes,
      attachments: files.map((file) => ({
        name: file.name,
        type: file.type,
      })),
    };
  }

  function restoreQuoteRequestIntent(intent) {
    if (!intent) {
      return;
    }

    if (intent.productType) {
      setProductType(intent.productType);
    }
    if (intent.quantity) {
      setQuantity(intent.quantity);
    }
    if (intent.requiredTimeline) {
      setRequiredTimeline(intent.requiredTimeline);
    }
    if (typeof intent.notes === "string") {
      setNotes(intent.notes);
    }
    if (Array.isArray(intent.attachments)) {
      setFiles(intent.attachments);
    }
  }

  async function startPricingDepositFlow(payload) {
    setDepositInitializing(true);
    try {
      const details = await initializePricingDepositPayment(payload);
      setDepositDetails(details);
      setDepositModalOpen(true);
    } catch (error) {
      setPricingError(error.message || "Unable to initialize deposit payment.");
    } finally {
      setDepositInitializing(false);
    }
  }

  function normalizeFiles(incomingFiles) {
    const validFiles = Array.from(incomingFiles).filter((file) => {
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      return isPdf || isImage;
    });
    setFiles((current) => [...current, ...validFiles]);
  }

  function handleFileChange(event) {
    if (!event.target.files) {
      return;
    }
    normalizeFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (!event.dataTransfer.files) {
      return;
    }
    normalizeFiles(event.dataTransfer.files);
  }

  async function handleRequestPricing() {
    setPricingError("");

    if (getKycStatus() !== "verified") {
      savePendingQuoteIntent(buildQuoteRequestPayload());
      router.push(
        `/kyc?returnUrl=${encodeURIComponent("/quote-request?resume=pricing")}`,
      );
      return;
    }

    if (!validateRequestInputs()) {
      return;
    }

    await startPricingDepositFlow(buildQuoteRequestPayload());
  }

  async function handleConfirmDepositPayment() {
    if (!depositDetails?.draftId) {
      setPricingError("Deposit payment details are missing. Please try again.");
      return;
    }

    setDepositConfirming(true);
    setPricingError("");

    try {
      const result = await confirmPricingDepositPayment({
        draftId: depositDetails.draftId,
        paymentReference: depositDetails.paymentReference,
      });
      setPricingPending(true);
      setRequestId(result.id);
      savePendingRequestId(result.id);
      setDepositModalOpen(false);
      router.push(`/quote-response?requestId=${result.id}`);
    } catch (error) {
      setPricingError(error.message || "Unable to confirm deposit payment.");
    } finally {
      setDepositConfirming(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedRequestId = window.localStorage.getItem(
      PENDING_QUOTE_REQUEST_KEY,
    );
    if (storedRequestId) {
      setRequestId(storedRequestId);
      setPricingPending(true);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const resume = router.query.resume;
    if (resume !== "pricing") {
      return;
    }

    if (getKycStatus() !== "verified") {
      return;
    }

    const pendingIntent = readPendingQuoteIntent();
    if (!pendingIntent) {
      router.replace("/quote-request", undefined, { shallow: true });
      return;
    }

    restoreQuoteRequestIntent(pendingIntent);
    clearPendingQuoteIntent();
    router.replace("/quote-request", undefined, { shallow: true });
    void startPricingDepositFlow(pendingIntent);
  }, [router.isReady, router.query.resume]);

  useEffect(() => {
    if (!pricingPending || !requestId) {
      return;
    }

    const checkStatus = async () => {
      if (pollingBusyRef.current) {
        return;
      }

      pollingBusyRef.current = true;

      try {
        const response = await getPricingRequestStatus(requestId);
        if (response.status === "pricing_ready") {
          clearPendingRequestId();
          router.push(response.redirectPath || "/quote-response");
        }
      } catch (error) {
        setPricingError(error.message || "Unable to check pricing status.");
      } finally {
        pollingBusyRef.current = false;
      }
    };

    checkStatus();
    const pollInterval = setInterval(checkStatus, 4000);
    return () => clearInterval(pollInterval);
  }, [pricingPending, requestId, router]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="page-title">Quote Request</h1>
        <p className="page-subtitle">
          Upload your product spec and request a pricing route.
        </p>

        <div className="mt-6 grid gap-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            className={`cursor-pointer rounded-xl border border-dashed bg-white p-8 text-center transition ${
              dragging ? "border-gold bg-[#FFF8EA]" : "border-[#B9A89D]"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <FileUp className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-3 text-sm font-semibold text-ink">
              Drag and drop your product files
            </p>
            <p className="mt-1 text-xs text-[#7B6A62]">
              Accepts image and PDF files
            </p>
            <p className="mt-2 text-xs font-medium text-leather">
              Click to browse files
            </p>
          </div>

          {files.length > 0 ? (
            <div className="rounded-lg border border-[#E4D8CD] bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7B6A62]">
                Selected files ({files.length})
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[#4C3E39]">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="truncate">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <label className="label">Product Type</label>
            <select
              className="input"
              value={productType}
              onChange={(event) => setProductType(event.target.value)}
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Quantity</label>
            <input
              className="input"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Required Timeline</label>
            <select
              className="input"
              value={requiredTimeline}
              onChange={(event) => setRequiredTimeline(event.target.value)}
              required
            >
              <option value="">Select timeline</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="3-4 weeks">3-4 weeks</option>
              <option value="1-2 months">1-2 months</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-28"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Share quality specs, dimensions, finishing details..."
            />
          </div>
        </div>
      </div>

      {pricingPending ? (
        <div className="rounded-xl border border-[#C49A3C55] bg-[#FFF8EA] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-semibold text-ink">
                Pricing Request Submitted
              </p>
              <p className="mt-1 text-sm text-[#5A4A44]">
                Pricing is awaiting admin review. Response time may vary based
                on queue and availability.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-[#7B6A62]">
                <Spinner size="xs" className="text-gold" />
                Checking for admin pricing updates automatically...
              </p>
              {requestId ? (
                <p className="mt-2 text-xs text-[#7B6A62]">
                  Request ID: {requestId}
                </p>
              ) : null}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link href="/dashboard" className="inline-flex">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Continue to Dashboard
                  </Button>
                </Link>
                <Link
                  href={`/quote-response?requestId=${requestId}`}
                  className="inline-flex"
                >
                  <Button variant="accent" className="w-full sm:w-auto">
                    Open Quote Response
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <FlaskConical className="h-7 w-7 text-gold" />
          <h3 className="mt-3 text-lg font-semibold text-ink">
            Request Sample First
          </h3>
          <p className="mt-2 text-sm text-[#5A4A44]">
            Get a physical sample produced first. Pay a flat fee, review via
            video, then proceed.
          </p>
          <Link href="/sample-order" className="mt-4 inline-block">
            <Button variant="accent">Request Sample</Button>
          </Link>
        </div>

        <div className="card p-6">
          <HandCoins className="h-7 w-7 text-leather" />
          <h3 className="mt-3 text-lg font-semibold text-ink">
            Request Pricing for Production
          </h3>
          <p className="mt-2 text-sm text-[#5A4A44]">
            Pay a refundable ₦20,000 deposit to unlock your production price
            list.
          </p>
          <div className="mt-4">
            <Button
              onClick={handleRequestPricing}
              disabled={depositInitializing}
            >
              {depositInitializing ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" className="text-white" />
                  <span>Preparing Deposit Checkout...</span>
                </span>
              ) : (
                "Request Pricing"
              )}
            </Button>
            {pricingError ? (
              <p className="mt-2 text-sm text-[#B42318]">{pricingError}</p>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={depositModalOpen}
        title="Pricing Deposit Checkout"
        onClose={() => setDepositModalOpen(false)}
      >
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
              Pricing Deposit Required
            </p>
            <p className="truncate text-sm text-[#5A4A44]">
              Pay ₦20,000 to submit your pricing request for admin review.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Secure
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#4D3F39]">
            <div className="flex items-center justify-between">
              <span className="text-[#5A4A44]">Deposit Amount</span>
              <span className="font-semibold text-ink">₦20,000</span>
            </div>
            {depositDetails?.paymentReference ? (
              <p className="mt-2 text-xs text-[#7B6A62]">
                Reference: {depositDetails.paymentReference}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={depositDetails?.authorizationUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full sm:w-auto"
            >
              <Button variant="accent" className="w-full sm:w-auto">
                Open Paystack
              </Button>
            </a>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={depositConfirming}
              onClick={handleConfirmDepositPayment}
            >
              {depositConfirming ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" className="text-gold" />
                  <span>Confirming Deposit...</span>
                </span>
              ) : (
                "I Have Paid Deposit"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
