import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import {
  getQuoteResponse,
  listPricingRequests,
  initializeQuoteBalancePayment,
  rejectQuoteRequest,
} from "../services/prototypeService";

const PENDING_QUOTE_REQUEST_KEY = "leddar_pending_quote_request_id";

export default function QuoteResponsePage() {
  const router = useRouter();
  const [requestId, setRequestId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quoteResponse, setQuoteResponse] = useState(null);
  const [quoteHistory, setQuoteHistory] = useState([]);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [balancePaymentDetails, setBalancePaymentDetails] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (typeof router.query.requestId === "string" && router.query.requestId) {
      setRequestId(router.query.requestId);
      return;
    }

    if (typeof window !== "undefined") {
      const storedRequestId = window.localStorage.getItem(
        PENDING_QUOTE_REQUEST_KEY,
      );
      if (storedRequestId) {
        setRequestId(storedRequestId);
      }
    }
  }, [router.isReady, router.query.requestId]);

  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      try {
        const history = await listPricingRequests();
        if (active) {
          setQuoteHistory(history);
        }
      } catch {
        // Keep existing history if request fails.
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 6000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const historySection = (
    <div className="card mt-6 max-w-2xl p-6">
      <h2 className="text-lg font-semibold text-ink">Quote History</h2>
      <p className="mt-1 text-sm text-[#5A4A44]">
        View all pricing requests and their current status.
      </p>

      {quoteHistory.length === 0 ? (
        <p className="mt-4 text-sm text-[#7B6A62]">No quote requests yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {quoteHistory.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[#E9DFD6] bg-white p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{item.id}</p>
                <Badge
                  status={
                    item.status === "pricing_ready"
                      ? "Ready"
                      : item.status === "rejected"
                        ? "Rejected"
                        : "Pending"
                  }
                />
              </div>
              <p className="mt-1 text-xs text-[#7B6A62]">
                {item.productType} • Qty {item.quantity}
              </p>
              <div className="mt-2">
                <Link
                  href={`/quote-response?requestId=${item.id}`}
                  className="inline-flex"
                >
                  <Button variant="outline" className="px-3 py-2 text-xs">
                    Open Response
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  async function handleOpenApproveModal() {
    if (!requestId) {
      return;
    }

    setApproveLoading(true);
    setError("");

    try {
      const details = await initializeQuoteBalancePayment(requestId);
      setBalancePaymentDetails(details);
      setApproveModalOpen(true);
    } catch (approveError) {
      setError(approveError.message || "Unable to initialize balance payment.");
    } finally {
      setApproveLoading(false);
    }
  }

  async function handleConfirmApprovePayment() {
    if (!balancePaymentDetails?.authorizationUrl) {
      setError("Balance payment details are unavailable.");
      return;
    }

    window.open(
      balancePaymentDetails.authorizationUrl,
      "_blank",
      "noopener,noreferrer",
    );
    setApproveModalOpen(false);
  }

  async function handleRejectQuote() {
    if (!requestId) {
      return;
    }

    setRejectSubmitting(true);
    setError("");

    try {
      const result = await rejectQuoteRequest(requestId, rejectReason);
      setQuoteResponse((current) => ({
        ...(current || {}),
        id: result.id,
        status: result.status,
        rejectionReason: result.rejectionReason,
      }));
      setRejectModalOpen(false);
      setRejectReason("");
    } catch (rejectError) {
      setError(rejectError.message || "Unable to submit rejection reason.");
    } finally {
      setRejectSubmitting(false);
    }
  }

  useEffect(() => {
    if (!requestId) {
      setQuoteResponse(null);
      return;
    }

    let active = true;

    const fetchQuote = async () => {
      if (!active) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getQuoteResponse(requestId);
        if (active) {
          if (
            typeof window !== "undefined" &&
            (response?.status === "pricing_ready" ||
              response?.status === "not_found")
          ) {
            window.localStorage.removeItem(PENDING_QUOTE_REQUEST_KEY);
          }
          setQuoteResponse(response);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message || "Unable to load quote response.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [requestId]);

  if (!requestId) {
    return (
      <PageWrapper>
        <div className="card max-w-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="page-title">Quote Response</h1>
            <Badge status="Pending" />
          </div>
          <p className="text-sm text-[#5A4A44]">
            No pricing request selected yet. Submit a quote request to receive a
            response from admin.
          </p>
          <div className="mt-6">
            <Link href="/quote-request" className="inline-flex">
              <Button variant="accent">Go to Quote Request</Button>
            </Link>
          </div>
        </div>
        {historySection}
      </PageWrapper>
    );
  }

  if (loading && !quoteResponse) {
    return (
      <PageWrapper>
        <div className="card max-w-2xl p-6">
          <div className="flex items-center gap-3 text-sm text-[#5A4A44]">
            <Spinner className="text-gold" />
            <span>Loading quote response...</span>
          </div>
        </div>
        {historySection}
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="card max-w-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="page-title">Quote Response</h1>
            <Badge status="Pending" />
          </div>
          <p className="text-sm text-[#B42318]">{error}</p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => router.reload()}>
              Retry
            </Button>
          </div>
        </div>
        {historySection}
      </PageWrapper>
    );
  }

  if (!quoteResponse || quoteResponse.status !== "pricing_ready") {
    if (quoteResponse?.status === "rejected") {
      return (
        <PageWrapper>
          <div className="card max-w-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="page-title">Quote Response</h1>
              <Badge status="Rejected" />
            </div>

            <div className="rounded-xl border border-[#F1C1C1] bg-[#FFF3F3] p-4 text-sm text-[#5A4A44]">
              <p className="font-semibold text-ink">Quote was rejected</p>
              <p className="mt-2">The brand has rejected this quote request.</p>
              {quoteResponse.rejectionReason ? (
                <p className="mt-3 rounded-lg border border-[#E8B5B5] bg-white p-3 text-sm text-[#5A4A44]">
                  <span className="font-semibold text-ink">Reason:</span>{" "}
                  {quoteResponse.rejectionReason}
                </p>
              ) : null}
            </div>
          </div>
          {historySection}
        </PageWrapper>
      );
    }

    return (
      <PageWrapper>
        <div className="card max-w-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="page-title">Quote Response</h1>
            <Badge status="Pending" />
          </div>

          <div className="rounded-xl border border-[#E9DFD6] bg-white p-4 text-sm text-[#5A4A44]">
            <p className="font-semibold text-ink">
              Pricing is pending admin input
            </p>
            <p className="mt-2">
              Your request has been received, but the admin has not added
              pricing yet. This page refreshes automatically every few seconds.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-[#7B6A62]">
              <Spinner size="xs" className="text-gold" />
              Waiting for quote response...
            </p>
          </div>
        </div>
        {historySection}
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="card max-w-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="page-title">Quote Response</h1>
          <Badge status="Ready" />
        </div>

        <div className="space-y-3 rounded-xl border border-[#E9DFD6] bg-white p-4">
          {quoteResponse.breakdown?.map((row) => (
            <div
              key={row.item}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-[#5A4A44]">{row.item}</span>
              <span className="font-semibold text-ink">{row.amount}</span>
            </div>
          ))}
          <div className="mt-2 border-t border-[#EAE1D8] pt-3 text-base font-bold text-ink">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span>{quoteResponse.total}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="accent"
            onClick={handleOpenApproveModal}
            disabled={approveLoading}
          >
            {approveLoading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" className="text-espresso" />
                <span>Preparing Payment...</span>
              </span>
            ) : (
              "Approve &amp; Proceed to Payment"
            )}
          </Button>
          <Button
            variant="dangerOutline"
            onClick={() => setRejectModalOpen(true)}
          >
            Reject Quote
          </Button>
        </div>
      </div>
      {historySection}

      <Modal
        open={approveModalOpen}
        title="Balance Payment Checkout"
        onClose={() => setApproveModalOpen(false)}
      >
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
              Pay Remaining Balance
            </p>
            <p className="truncate text-sm text-[#5A4A44]">
              Deposit of ₦20,000 has already been deducted from the quote.
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
              <span className="text-[#5A4A44]">Total Quote</span>
              <span className="font-semibold text-ink">
                {quoteResponse.total || "₦70,000"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[#5A4A44]">Deposit Applied</span>
              <span className="font-semibold text-ink">₦20,000</span>
            </div>
            <div className="mt-2 border-t border-[#EAE1D8] pt-2 flex items-center justify-between text-base font-bold text-ink">
              <span>Balance Due</span>
              <span>
                {balancePaymentDetails?.amountDue
                  ? `₦${balancePaymentDetails.amountDue.toLocaleString()}`
                  : "₦50,000"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={balancePaymentDetails?.authorizationUrl || "#"}
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
              onClick={handleConfirmApprovePayment}
            >
              Go to Paystack
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={rejectModalOpen}
        title="Reject Quote"
        onClose={() => setRejectModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#5A4A44]">
            Tell us why you are rejecting this quote. This helps the admin
            improve the next revision.
          </p>
          <div>
            <label className="label">Reason for rejection</label>
            <textarea
              className="input min-h-28"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Enter your reason for rejecting this quote"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="dangerOutline"
              className="w-full sm:w-auto"
              onClick={handleRejectQuote}
              disabled={rejectSubmitting}
            >
              {rejectSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" className="text-[#B42318]" />
                  <span>Submitting Reason...</span>
                </span>
              ) : (
                "Submit Rejection"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
