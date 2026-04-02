import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleCheckBig, FileUp, FlaskConical, HandCoins, LoaderCircle } from "lucide-react";
import { useRouter } from "next/router";
import { productTypes } from "../../data/mockData";
import Button from "../ui/Button";
import { getPricingRequestStatus, submitPricingRequest } from "../../services/prototypeService";

export default function QuoteForm() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(100);
  const [productType, setProductType] = useState(productTypes[0]);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [pricingSubmitting, setPricingSubmitting] = useState(false);
  const [pricingError, setPricingError] = useState("");
  const [pricingPending, setPricingPending] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [requestId, setRequestId] = useState("");
  const fileInputRef = useRef(null);
  const pollingBusyRef = useRef(false);

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

    if (!quantity || Number(quantity) <= 0) {
      setPricingError("Please provide a valid quantity before requesting pricing.");
      return;
    }

    if (files.length === 0) {
      setPricingError("Please upload at least one product spec file.");
      return;
    }

    setPricingSubmitting(true);
    try {
      const result = await submitPricingRequest({
        productType,
        quantity: Number(quantity),
        notes,
        attachments: files.map((file) => ({ name: file.name, type: file.type }))
      });
      setPricingPending(true);
      setRequestId(result.id);
    } catch (error) {
      setPricingError(error.message || "Unable to submit pricing request.");
    } finally {
      setPricingSubmitting(false);
    }
  }

  useEffect(() => {
    if (!pricingPending || !requestId) {
      return;
    }

    const checkStatus = async () => {
      if (pollingBusyRef.current) {
        return;
      }

      pollingBusyRef.current = true;
      setCheckingStatus(true);

      try {
        const response = await getPricingRequestStatus(requestId);
        if (response.status === "pricing_ready") {
          router.push(response.redirectPath || "/quote-response");
        }
      } catch (error) {
        setPricingError(error.message || "Unable to check pricing status.");
      } finally {
        pollingBusyRef.current = false;
        setCheckingStatus(false);
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
              <p className="text-sm font-semibold text-ink">Pricing Request Submitted</p>
              <p className="mt-1 text-sm text-[#5A4A44]">
                Your request has been sent to the admin panel and is now pending. Please wait while the admin inputs pricing details.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-[#7B6A62]">
                <LoaderCircle className={`h-3.5 w-3.5 ${checkingStatus ? "animate-spin" : ""}`} />
                Checking for admin pricing updates automatically...
              </p>
              {requestId ? (
                <p className="mt-2 text-xs text-[#7B6A62]">Request ID: {requestId}</p>
              ) : null}
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
            Skip samples and go straight to full production pricing.
          </p>
          <div className="mt-4">
            <Button onClick={handleRequestPricing} disabled={pricingSubmitting}>
              {pricingSubmitting ? "Submitting Request..." : "Request Pricing"}
            </Button>
            {pricingError ? (
              <p className="mt-2 text-sm text-[#B42318]">{pricingError}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
