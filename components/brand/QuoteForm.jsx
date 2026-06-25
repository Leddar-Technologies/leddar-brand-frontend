// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import {
//   CircleCheckBig,
//   CreditCard,
//   FileUp,
//   FlaskConical,
//   ShieldCheck,
// } from "lucide-react";
// import { useRouter } from "next/router";
// import { productTypes } from "../../data/mockData";
// import Button from "../ui/Button";
// import Modal from "../ui/Modal";
// import Spinner from "../ui/Spinner";
// import {
//   confirmPricingDepositPayment,
//   getPricingRequestStatus,
//   initializePricingDepositPayment,
// } from "../../services/prototypeService";
// import { getKycStatus } from "../../services/authService";
// import { formatVatPercent } from "../../utils/pricing";

// const PENDING_QUOTE_REQUEST_KEY = "leddar_pending_quote_request_id";
// const PENDING_QUOTE_INTENT_KEY = "leddar_pending_quote_intent";

// export default function QuoteForm() {
//   const router = useRouter();
//   const [quantity, setQuantity] = useState(100);
//   const [productType, setProductType] = useState(productTypes[0]);
//   const [requiredTimeline, setRequiredTimeline] = useState("");
//   const [notes, setNotes] = useState("");
//   const [files, setFiles] = useState([]);
//   const [dragging, setDragging] = useState(false);
//   const [pricingError, setPricingError] = useState("");
//   const [pricingPending, setPricingPending] = useState(false);
//   const [depositModalOpen, setDepositModalOpen] = useState(false);
//   const [depositInitializing, setDepositInitializing] = useState(false);
//   const [depositConfirming, setDepositConfirming] = useState(false);
//   const [depositDetails, setDepositDetails] = useState(null);
//   const [requestId, setRequestId] = useState("");
//   const fileInputRef = useRef(null);
//   const pollingBusyRef = useRef(false);
//   const canSubmitRequest =
//     Number(quantity) > 0 && files.length > 0 && Boolean(requiredTimeline);

//   function savePendingRequestId(id) {
//     if (typeof window === "undefined" || !id) {
//       return;
//     }
//     window.localStorage.setItem(PENDING_QUOTE_REQUEST_KEY, id);
//   }

//   function savePendingQuoteIntent(intent) {
//     if (typeof window === "undefined" || !intent) {
//       return;
//     }
//     window.sessionStorage.setItem(
//       PENDING_QUOTE_INTENT_KEY,
//       JSON.stringify(intent),
//     );
//   }

//   function readPendingQuoteIntent() {
//     if (typeof window === "undefined") {
//       return null;
//     }

//     try {
//       const raw = window.sessionStorage.getItem(PENDING_QUOTE_INTENT_KEY);
//       return raw ? JSON.parse(raw) : null;
//     } catch {
//       return null;
//     }
//   }

//   function clearPendingQuoteIntent() {
//     if (typeof window === "undefined") {
//       return;
//     }
//     window.sessionStorage.removeItem(PENDING_QUOTE_INTENT_KEY);
//   }

//   function clearPendingRequestId() {
//     if (typeof window === "undefined") {
//       return;
//     }
//     window.localStorage.removeItem(PENDING_QUOTE_REQUEST_KEY);
//   }

//   function validateRequestInputs() {
//     if (!quantity || Number(quantity) <= 0) {
//       setPricingError(
//         "Please provide a valid quantity before requesting pricing.",
//       );
//       return false;
//     }

//     if (files.length === 0) {
//       setPricingError("Please upload at least one product spec file.");
//       return false;
//     }

//     if (!requiredTimeline) {
//       setPricingError("Please select a required timeline.");
//       return false;
//     }

//     return true;
//   }

//   function buildQuoteRequestPayload() {
//     return {
//       productType,
//       quantity: Number(quantity),
//       requiredTimeline,
//       notes,
//       attachments: files.map((file) => ({
//         name: file.name,
//         type: file.type,
//       })),
//     };
//   }

//   function restoreQuoteRequestIntent(intent) {
//     if (!intent) {
//       return;
//     }

//     if (intent.productType) {
//       setProductType(intent.productType);
//     }
//     if (intent.quantity) {
//       setQuantity(intent.quantity);
//     }
//     if (intent.requiredTimeline) {
//       setRequiredTimeline(intent.requiredTimeline);
//     }
//     if (typeof intent.notes === "string") {
//       setNotes(intent.notes);
//     }
//     if (Array.isArray(intent.attachments)) {
//       setFiles(intent.attachments);
//     }
//   }

//   async function startPricingDepositFlow(payload) {
//     setDepositInitializing(true);
//     try {
//       const details = await initializePricingDepositPayment(payload);
//       setDepositDetails(details);
//       setDepositModalOpen(true);
//     } catch (error) {
//       setPricingError(error.message || "Unable to initialize deposit payment.");
//     } finally {
//       setDepositInitializing(false);
//     }
//   }

//   async function submitPricingFromSampleCredit(payload) {
//     setDepositInitializing(true);
//     setPricingError("");

//     try {
//       const details = await initializePricingDepositPayment(payload);
//       const result = await confirmPricingDepositPayment({
//         draftId: details.draftId,
//         paymentReference: details.paymentReference,
//       });

//       setPricingPending(true);
//       setRequestId(result.id);
//       savePendingRequestId(result.id);
//       router.push(`/order-status?requestId=${result.id}`);
//     } catch (error) {
//       setPricingError(
//         error.message ||
//           "Unable to submit production pricing request from sample approval.",
//       );
//     } finally {
//       setDepositInitializing(false);
//     }
//   }

//   function normalizeFiles(incomingFiles) {
//     const validFiles = Array.from(incomingFiles).filter((file) => {
//       const isPdf = file.type === "application/pdf";
//       const isImage = file.type.startsWith("image/");
//       const isVideo = file.type.startsWith("video/"); 
//       return isPdf || isImage || isVideo;
//     });
//     setFiles((current) => [...current, ...validFiles]);
//   }

//   function handleFileChange(event) {
//     if (!event.target.files) {
//       return;
//     }
//     normalizeFiles(event.target.files);
//     event.target.value = "";
//   }

//   function handleDrop(event) {
//     event.preventDefault();
//     setDragging(false);
//     if (!event.dataTransfer.files) {
//       return;
//     }
//     normalizeFiles(event.dataTransfer.files);
//   }

//   async function handleRequestPricing() {
//     setPricingError("");

//     if (!validateRequestInputs()) {
//       return;
//     }

//     if (getKycStatus() !== "verified") {
//       savePendingQuoteIntent(buildQuoteRequestPayload());
//       router.push(
//         `/kyc?returnUrl=${encodeURIComponent("/new-order?resume=pricing")}`,
//       );
//       return;
//     }

//     await startPricingDepositFlow(buildQuoteRequestPayload());
//   }

//  async function handleRequestSample() {
//    setPricingError("");

//    if (!validateRequestInputs()) {
//      return;
//    }

//    const kycProfile = await getKycStatus();
//    if (kycProfile?.status !== "verified") {
//      savePendingQuoteIntent(buildQuoteRequestPayload());
//      router.push(
//        `/kyc?returnUrl=${encodeURIComponent("/new-order?resume=sample")}`,
//      );
//      return;
//    }

//    // Save the quote intent so SampleInfoPage can read it on arrival
//    savePendingQuoteIntent(buildQuoteRequestPayload());
//    router.push("/sample-requests?source=new-order");
//  }

//   async function handleConfirmDepositPayment() {
//     if (!depositDetails?.draftId) {
//       setPricingError("Deposit payment details are missing. Please try again.");
//       return;
//     }

//     setDepositConfirming(true);
//     setPricingError("");

//     try {
//       const result = await confirmPricingDepositPayment({
//         draftId: depositDetails.draftId,
//         paymentReference: depositDetails.paymentReference,
//       });
//       setPricingPending(true);
//       setRequestId(result.id);
//       savePendingRequestId(result.id);
//       setDepositModalOpen(false);
//       router.push(`/order-status?requestId=${result.id}`);
//     } catch (error) {
//       setPricingError(error.message || "Unable to confirm deposit payment.");
//     } finally {
//       setDepositConfirming(false);
//     }
//   }

//   useEffect(() => {
//     if (typeof window === "undefined") {
//       return;
//     }

//     const storedRequestId = window.localStorage.getItem(
//       PENDING_QUOTE_REQUEST_KEY,
//     );
//     if (storedRequestId) {
//       setRequestId(storedRequestId);
//       setPricingPending(true);
//     }
//   }, []);

//   useEffect(() => {
//     if (!router.isReady) {
//       return;
//     }

//     const resume = router.query.resume;
//     if (resume !== "pricing") {
//       return;
//     }

//     if (getKycStatus() !== "verified") {
//       return;
//     }

//     const pendingIntent = readPendingQuoteIntent();
//     if (!pendingIntent) {
//       router.replace("/new-order", undefined, { shallow: true });
//       return;
//     }

//     restoreQuoteRequestIntent(pendingIntent);
//     clearPendingQuoteIntent();
//     const isFromSampleFlow = router.query.source === "sample";
//     router.replace("/new-order", undefined, { shallow: true });

//     if (isFromSampleFlow) {
//       void submitPricingFromSampleCredit(pendingIntent);
//       return;
//     }

//     void startPricingDepositFlow(pendingIntent);
//   }, [router.isReady, router.query.resume]);

//   useEffect(() => {
//     if (!pricingPending || !requestId) {
//       return;
//     }

//     const checkStatus = async () => {
//       if (pollingBusyRef.current) {
//         return;
//       }

//       pollingBusyRef.current = true;

//       try {
//         const response = await getPricingRequestStatus(requestId);
//         if (response.status === "pricing_ready") {
//           clearPendingRequestId();
//           router.push(response.redirectPath || "/order-status");
//         }
//       } catch (error) {
//         setPricingError(error.message || "Unable to check pricing status.");
//       } finally {
//         pollingBusyRef.current = false;
//       }
//     };

//     checkStatus();
//     const pollInterval = setInterval(checkStatus, 4000);
//     return () => clearInterval(pollInterval);
//   }, [pricingPending, requestId, router]);

//   return (
//     <div className="space-y-6">
//       <div className="card p-6">
//         <h1 className="page-title">Production Request</h1>
//         <p className="page-subtitle">
//           Tell us what you want to produce, we’ll match you with the right
//           artisan and provide pricing
//         </p>

//         <div className="mt-6 grid gap-5">
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*,application/pdf,video/*"
//             multiple
//             className="hidden"
//             onChange={handleFileChange}
//           />

//           <div
//             className={`cursor-pointer rounded-xl border border-dashed bg-white p-8 text-center transition ${
//               dragging ? "border-gold bg-[#FFF8EA]" : "border-[#B9A89D]"
//             }`}
//             onClick={() => fileInputRef.current?.click()}
//             onDragOver={(event) => {
//               event.preventDefault();
//               setDragging(true);
//             }}
//             onDragLeave={() => setDragging(false)}
//             onDrop={handleDrop}
//           >
//             <FileUp className="mx-auto h-8 w-8 text-gold" />
//             <p className="mt-3 text-sm font-semibold text-ink">
//               Drag and drop your product files
//             </p>
//             <p className="mt-1 text-xs text-[#7B6A62]">
//               Accepts image and PDF files
//             </p>
//             <p className="mt-2 text-xs font-medium text-leather">
//               Click to browse files
//             </p>
//           </div>

//           {files.length > 0 ? (
//             <div className="rounded-lg border border-[#E4D8CD] bg-white p-3">
//               <p className="text-xs font-semibold uppercase tracking-wide text-[#7B6A62]">
//                 Selected files ({files.length})
//               </p>
//               <ul className="mt-2 space-y-1 text-sm text-[#4C3E39]">
//                 {files.map((file, index) => (
//                   <li key={`${file.name}-${index}`} className="truncate">
//                     {file.name}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ) : null}

//           <div>
//             <label className="label">Product Type</label>
//             <select
//               className="input"
//               value={productType}
//               onChange={(event) => setProductType(event.target.value)}
//             >
//               {productTypes.map((type) => (
//                 <option key={type} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="label">Quantity</label>
//             <input
//               className="input"
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="label">Required Timeline</label>
//             <select
//               className="input"
//               value={requiredTimeline}
//               onChange={(event) => setRequiredTimeline(event.target.value)}
//               required
//             >
//               <option value="">Select timeline</option>
//               <option value="1-2 weeks">1-2 weeks(urgent)</option>
//               <option value="3-4 weeks">3-4 weeks</option>
//               <option value="1-2 months">1-2 months</option>
//               <option value="1-2 months">2–3 months</option>
//               <option value="Flexible">Flexible</option>
//             </select>
//           </div>

//           <div>
//             <label className="label">Notes</label>
//             <textarea
//               className="input min-h-28"
//               value={notes}
//               onChange={(event) => setNotes(event.target.value)}
//               placeholder="Share quality specs, dimensions, finishing details..."
//             />
//           </div>
//         </div>
//       </div>

//       {pricingPending ? (
//         <div className="rounded-xl border border-[#C49A3C55] bg-[#FFF8EA] p-4 sm:p-5">
//           <div className="flex items-start gap-3">
//             <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
//             <div>
//               <p className="text-sm font-semibold text-ink">
//                 Pricing Request Submitted
//               </p>
//               <p className="mt-1 text-sm text-[#5A4A44]">
//                 Pricing is awaiting admin review. Response time may vary based
//                 on queue and availability.
//               </p>
//               <p className="mt-2 inline-flex items-center gap-2 text-xs text-[#7B6A62]">
//                 <Spinner size="xs" className="text-gold" />
//                 Checking for admin pricing updates automatically...
//               </p>
//               {requestId ? (
//                 <p className="mt-2 text-xs text-[#7B6A62]">
//                   Request ID: {requestId}
//                 </p>
//               ) : null}
//               <div className="mt-3 flex flex-col gap-2 sm:flex-row">
//                 <Link href="/dashboard" className="inline-flex">
//                   <Button variant="outline" className="w-full sm:w-auto">
//                     Continue to Dashboard
//                   </Button>
//                 </Link>
//                 <Link
//                   href={`/order-status?requestId=${requestId}`}
//                   className="inline-flex"
//                 >
//                   <Button variant="accent" className="w-full sm:w-auto">
//                     Open Quote Response
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}

//       <div className="grid gap-4 md:grid-cols-2">
//         <div className="card p-6 md:col-span-2">
//           <FlaskConical className="h-7 w-7 text-gold" />
//           <h3 className="mt-3 text-lg font-semibold text-ink">
//             Start with a Sample
//           </h3>
//           <p className="mt-2 text-sm text-[#5A4A44]">
//             Produce a sample first to confirm quality before full production
//           </p>
//           <div className="mt-4">
//             <Button
//               variant="accent"
//               onClick={handleRequestSample}
//               disabled={!canSubmitRequest}
//             >
//               Request Sample
//             </Button>
//           </div>
//         </div>
//       </div>

//       {pricingError ? (
//         <p className="text-sm text-[#B42318]">{pricingError}</p>
//       ) : null}

//       <Modal
//         open={depositModalOpen}
//         title="Pricing Deposit Checkout"
//         onClose={() => setDepositModalOpen(false)}
//       >
//         <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
//             <CreditCard className="h-5 w-5" />
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
//               Pricing Deposit Required
//             </p>
//             <p className="truncate text-sm text-[#5A4A44]">
//               Pay ₦20,000 to submit your pricing request for admin review.
//             </p>
//           </div>
//           <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
//             <ShieldCheck className="mr-1 h-3.5 w-3.5" />
//             Secure
//           </span>
//         </div>

//         <div className="space-y-4">
//           <div className="rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#4D3F39]">
//             <div className="flex items-center justify-between">
//               <span className="text-[#5A4A44]">Deposit Amount</span>
//               <span className="font-semibold text-ink">₦20,000</span>
//             </div>
//             <p className="mt-2 text-xs text-[#7B6A62]">
//               VAT ({formatVatPercent()}) applies to the full production quote
//               and is displayed during balance checkout.
//             </p>
//             {depositDetails?.paymentReference ? (
//               <p className="mt-2 text-xs text-[#7B6A62]">
//                 Reference: {depositDetails.paymentReference}
//               </p>
//             ) : null}
//           </div>

//           <div className="flex flex-col gap-3 sm:flex-row">
//             <a
//               href={depositDetails?.authorizationUrl || "#"}
//               target="_blank"
//               rel="noreferrer"
//               className="inline-flex w-full sm:w-auto"
//             >
//               <Button variant="accent" className="w-full sm:w-auto">
//                 Open Paystack
//               </Button>
//             </a>
//             <Button
//               variant="outline"
//               className="w-full sm:w-auto"
//               disabled={depositConfirming}
//               onClick={handleConfirmDepositPayment}
//             >
//               {depositConfirming ? (
//                 <span className="inline-flex items-center gap-2">
//                   <Spinner size="sm" className="text-gold" />
//                   <span>Confirming Deposit...</span>
//                 </span>
//               ) : (
//                 "I Have Paid Deposit"
//               )}
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

// components/brand/QuoteForm.jsx
import { useEffect, useRef, useState } from "react";
import {
  FileUp, X, FlaskConical, CheckCircle2,
  Image as ImageIcon, FileText, Film, ChevronRight,
  Minus, Plus, Clock, Package, StickyNote,
} from "lucide-react";
import { useRouter } from "next/router";
import { productTypes } from "../../data/mockData";
import Button from "../ui/Button";
import { getKycStatus } from "../../services/authService";
import { setPendingFiles } from "../../services/fileStore";
import api from "../../services/api";

const PENDING_QUOTE_INTENT_KEY  = "leddar_pending_quote_intent";
const PENDING_QUOTE_FILE_IDS_KEY = "leddar_pending_quote_file_ids";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const TIMELINES = [
  { value: "1-2 weeks",  label: "1–2 Weeks",  sub: "Urgent",    color: "#B42318" },
  { value: "3-4 weeks",  label: "3–4 Weeks",  sub: "Standard",  color: "#C49A3C" },
  { value: "1-2 months", label: "1–2 Months", sub: "Relaxed",   color: "#2D6A4F" },
  { value: "2-3 months", label: "2–3 Months", sub: "Extended",  color: "#5A4A44" },
  { value: "Flexible",   label: "Flexible",   sub: "Open",      color: "#6B3A2A" },
];

function fileIcon(file) {
  if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-[#C49A3C]" />;
  if (file.type === "application/pdf") return <FileText className="h-4 w-4 text-[#B42318]" />;
  if (file.type.startsWith("video/")) return <Film className="h-4 w-4 text-[#5A4A44]" />;
  return <FileText className="h-4 w-4 text-[#9B8A82]" />;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SectionHeader({ number, icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C49A3C15] text-sm font-bold text-[#C49A3C] border border-[#C49A3C30]">
        {number}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-ink flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-[#C49A3C]" /> {title}
        </p>
        {subtitle && <p className="text-xs text-[#7B6A62] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// Default fallback prices in case API is unavailable
const DEFAULT_PRICES = {
  "Men Footwear":           30000,
  "Women Footwear":         30000,
  "Men Bags":               45000,
  "Women Bags":             45000,
  "Belts":                  25000,
  "Wallets & Small Goods":  25000,
  "Custom Leather Products": 50000,
};

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

export default function QuoteForm() {
  const router       = useRouter();
  const fileInputRef = useRef(null);

  const [quantity, setQuantity]                 = useState(100);
  const [productType, setProductType]           = useState(productTypes[0]);
  const [requiredTimeline, setRequiredTimeline] = useState("");
  const [notes, setNotes]                       = useState("");
  const [files, setFiles]                       = useState([]);
  const [dragging, setDragging]                 = useState(false);
  const [error, setError]                       = useState("");
  const [rejectedFiles, setRejectedFiles]       = useState([]);
  const [pricingMap, setPricingMap]             = useState(DEFAULT_PRICES);

  // Fetch live prices on mount
  useEffect(() => {
    api.get("/brands/sample-pricing")
      .then((res) => {
        if (res.data?.data?.map) setPricingMap(res.data.data.map);
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  // Price for the currently selected product type
  const samplePrice = pricingMap[productType] ?? 30000;

  const canSubmit = Number(quantity) > 0 && files.length > 0 && Boolean(requiredTimeline);

  // ── helpers ────────────────────────────────────────────────────────────────
  function validate() {
    if (!quantity || Number(quantity) <= 0) { setError("Please enter a valid quantity."); return false; }
    if (files.length === 0)                  { setError("Please upload at least one product spec file."); return false; }
    if (!requiredTimeline)                   { setError("Please select a required timeline."); return false; }
    return true;
  }

  function buildIntent() {
    return {
      productType, quantity: Number(quantity), requiredTimeline, notes,
      attachments: files.map((f) => ({ name: f.name, type: f.type })),
      samplePrice,
    };
  }

  function normalizeFiles(incoming) {
    const DOC_LIMIT   = 10  * 1024 * 1024; // 10 MB
    const VIDEO_LIMIT = 100 * 1024 * 1024; // 100 MB
    const rejected = [];
    const valid    = [];

    // Count existing file types
    const existingImages = files.filter((f) => f.type.startsWith("image/")).length;
    const existingVideos = files.filter((f) => f.type.startsWith("video/")).length;
    const existingPdfs   = files.filter((f) => f.type === "application/pdf").length;

    // Track additions within this batch
    let addedImages = 0;
    let addedVideos = 0;
    let addedPdfs   = 0;

    Array.from(incoming).forEach((f) => {
      const isVideo = f.type.startsWith("video/");
      const isImage = f.type.startsWith("image/");
      const isPdf   = f.type === "application/pdf";

      if (!isVideo && !isImage && !isPdf) return;

      // Per-type count limits
      if (isImage && existingImages + addedImages >= 1) {
        rejected.push(`${f.name} (only 1 image allowed)`);
        return;
      }
      if (isVideo && existingVideos + addedVideos >= 1) {
        rejected.push(`${f.name} (only 1 video allowed)`);
        return;
      }
      if (isPdf && existingPdfs + addedPdfs >= 1) {
        rejected.push(`${f.name} (only 1 PDF allowed)`);
        return;
      }

      // Size limits
      const maxBytes = isVideo ? VIDEO_LIMIT : DOC_LIMIT;
      if (f.size > maxBytes) {
        rejected.push(`${f.name} (${isVideo ? "videos max 100 MB" : "images & PDFs max 10 MB"})`);
        return;
      }

      if (isImage) addedImages++;
      if (isVideo) addedVideos++;
      if (isPdf)   addedPdfs++;
      valid.push(f);
    });

    if (rejected.length > 0) setRejectedFiles(rejected);
    if (valid.length > 0)    setFiles((prev) => [...prev, ...valid]);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function checkKyc() {
    const p = await getKycStatus();
    return p?.status === "verified";
  }

  async function handleRequestSample() {
    setError("");
    if (!validate()) return;

    const ok = await checkKyc();
    if (!ok) {
      window.sessionStorage.setItem(PENDING_QUOTE_INTENT_KEY, JSON.stringify(buildIntent()));
      router.push(`/kyc?returnUrl=${encodeURIComponent("/new-order?resume=sample")}`);
      return;
    }

    // Store File objects in module-level store — they survive client-side navigation.
    // Upload happens on the sample-requests page just before the Paystack redirect,
    // so files are only sent to S3 when the brand actually commits to paying.
    setPendingFiles(files);
    window.sessionStorage.setItem(PENDING_QUOTE_INTENT_KEY, JSON.stringify(buildIntent()));
    router.push("/sample-requests?source=new-order");
  }

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.resume) return;
    const raw = window.sessionStorage.getItem(PENDING_QUOTE_INTENT_KEY);
    if (!raw) return;
    try {
      const intent = JSON.parse(raw);
      if (intent.productType)      setProductType(intent.productType);
      if (intent.quantity)         setQuantity(intent.quantity);
      if (intent.requiredTimeline) setRequiredTimeline(intent.requiredTimeline);
      if (typeof intent.notes === "string") setNotes(intent.notes);
    } catch { /* ignore */ }
    router.replace("/new-order", undefined, { shallow: true });
  }, [router.isReady, router.query.resume]);

  // ── completion signals ──────────────────────────────────────────────────────
  const step1Done = files.length > 0;
  const step2Done = Boolean(productType) && Number(quantity) > 0;
  const step3Done = Boolean(requiredTimeline);

  return (
    <div className="max-w-3xl mx-auto pb-10">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="relative -mx-4 sm:-mx-6 md:-mx-8 mb-8 overflow-hidden">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(196,154,60,0.18) 0%, rgba(107,58,42,0.12) 40%, rgba(196,154,60,0.06) 70%, transparent 100%)",
          }}
        />
        {/* Decorative blobs */}
        <div
          className="absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #C49A3C 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-8 h-32 w-32 rounded-full opacity-10 blur-2xl"
          style={{ background: "radial-gradient(circle, #6B3A2A 0%, transparent 70%)" }}
        />

        <div className="relative px-4 sm:px-6 md:px-8 pt-7 pb-8">
          <div className="flex items-center gap-2 text-xs text-[#8B6A39] font-medium mb-3">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink font-semibold">New Order</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-ink">New Production Request</h1>
          <p className="mt-1.5 text-sm text-[#5A4A44] max-w-lg">
            Tell us what you need — we'll match you with the right artisan and provide a quote.
          </p>

          {/* Progress pills */}
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            {[
              { n: 1, label: "Upload Files",    done: step1Done },
              { n: 2, label: "Product Details", done: step2Done },
              { n: 3, label: "Timeline",         done: step3Done },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all backdrop-blur-sm ${
                  s.done
                    ? "bg-[#2D6A4F20] text-[#2D6A4F] border border-[#2D6A4F40]"
                    : "bg-white/60 text-[#7B6A62] border border-[#E4D8CD]"
                }`}>
                  {s.done
                    ? <CheckCircle2 className="h-3.5 w-3.5" />
                    : <span className="h-3.5 w-3.5 flex items-center justify-center rounded-full border border-current text-[10px]">{s.n}</span>
                  }
                  {s.label}
                </div>
                {i < arr.length - 1 && <div className="h-px w-4 bg-[#C49A3C40]" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">

        {/* ── File size rejection banner ────────────────────────────────── */}
        {rejectedFiles.length > 0 && (
          <div className="relative overflow-hidden rounded-xl border border-[#FAD5D0]">
            {/* gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(180,35,24,0.10) 0%, rgba(180,35,24,0.04) 50%, transparent 100%)",
              }}
            />
            {/* decorative blob */}
            <div
              className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
              style={{ background: "radial-gradient(circle, #B42318 0%, transparent 70%)" }}
            />
            <div className="relative flex items-start gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B4231815] border border-[#FAD5D0]">
                <X className="h-4 w-4 text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-danger">
                  {rejectedFiles.length === 1 ? "File too large" : `${rejectedFiles.length} files too large`}
                </p>
                <p className="mt-0.5 text-xs text-[#7B6A62]">
                  Images &amp; PDFs max 10 MB · Videos max 100 MB. <br /> The following {rejectedFiles.length === 1 ? "file was" : "files were"} not added:
                </p>
                <ul className="mt-2 space-y-1">
                  {rejectedFiles.map((name, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[#5A4A44]">
                      <span className="h-1.5 w-1.5 rounded-full bg-danger shrink-0" />
                      <span className="truncate font-medium">{name}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2.5 text-xs text-[#9B8A82]">
                  Try compressing the file before uploading.
                </p>
              </div>
              <button
                onClick={() => setRejectedFiles([])}
                className="shrink-0 rounded-full p-1 text-[#9B8A82] hover:bg-[#FAD5D0] hover:text-danger transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Section 1: Upload ─────────────────────────────────────────── */}
        <div className="card p-6">
          <SectionHeader
            number="1"
            icon={FileUp}
            title="Product Files"
            subtitle="Upload images, PDFs or videos of your product spec or reference"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,video/*"
            multiple
            className="hidden"
            onChange={(e) => { normalizeFiles(e.target.files); e.target.value = ""; }}
          />

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); normalizeFiles(e.dataTransfer.files); }}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragging
                ? "border-gold bg-[#FFF8EA] scale-[1.01]"
                : "border-[#D7CBC1] bg-[#FDFAF7] hover:border-gold hover:bg-[#FFFCF5]"
            }`}
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-[#C49A3C12] flex items-center justify-center mb-3">
              <FileUp className="h-6 w-6 text-gold" />
            </div>
            <p className="text-sm font-semibold text-ink">Drop files here or click to browse</p>
            <p className="mt-1 text-xs text-[#9B8A82]">1 image · 1 PDF · 1 video &nbsp;·&nbsp; Images &amp; PDFs max 10 MB · Videos max 100 MB</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FAF7F4] border border-[#E8DED5]">
                    {fileIcon(file)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                    {file.size > 0 && (
                      <p className="text-xs text-[#9B8A82]">{formatBytes(file.size)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="shrink-0 rounded-full p-1 text-[#9B8A82] hover:bg-[#FFF0EF] hover:text-danger transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs font-medium text-[#8B6A39] hover:text-gold transition-colors"
              >
                + Add more files
              </button>
            </div>
          )}
        </div>

        {/* ── Section 2: Product Details ────────────────────────────────── */}
        <div className="card p-6">
          <SectionHeader
            number="2"
            icon={Package}
            title="Product Details"
            subtitle="Tell us what you're producing and how many units you need"
          />

          {/* Product type chips */}
          <div className="mb-5">
            <label className="label">Product Type</label>
            <div className="flex flex-wrap gap-2">
              {productTypes.map((t) => {
                const price = pricingMap[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setProductType(t)}
                    className={`flex flex-col items-start rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                      productType === t
                        ? "border-gold bg-[#C49A3C15] text-[#8B6A39] shadow-sm"
                        : "border-[#E4D8CD] bg-white text-[#5A4A44] hover:border-[#C49A3C80] hover:bg-[#FFFCF5]"
                    }`}
                  >
                    <span>{t}</span>
                    {price && (
                      <span className={`text-xs mt-0.5 font-semibold ${productType === t ? "text-gold" : "text-[#9B8A82]"}`}>
                        {formatNaira(price)} sample
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity stepper */}
          <div>
            <label className="label">Quantity</label>
            <div className="flex items-center gap-0 w-fit rounded-lg border border-[#D7CBC1] bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, Number(q) - 10))}
                className="flex h-11 w-11 items-center justify-center text-[#5A4A44] hover:bg-[#FAF7F4] transition-colors border-r border-[#D7CBC1]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-11 w-24 bg-transparent text-center text-sm font-semibold text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Number(q) + 10)}
                className="flex h-11 w-11 items-center justify-center text-[#5A4A44] hover:bg-[#FAF7F4] transition-colors border-l border-[#D7CBC1]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[#9B8A82]">Minimum order quantity varies by product type</p>
          </div>
        </div>

        {/* ── Section 3: Timeline ───────────────────────────────────────── */}
        <div className="card p-6">
          <SectionHeader
            number="3"
            icon={Clock}
            title="Required Timeline"
            subtitle="When do you need the production completed?"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:grid-cols-5">
            {TIMELINES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setRequiredTimeline(t.value)}
                className={`flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
                  requiredTimeline === t.value
                    ? "border-gold bg-[#FFF8EA] shadow-sm"
                    : "border-[#E4D8CD] bg-white hover:border-[#C49A3C80] hover:bg-[#FFFCF5]"
                }`}
              >
                <div
                  className="h-2 w-2 rounded-full mb-2"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-sm font-semibold text-ink">{t.label}</span>
                <span className="text-[11px] text-[#9B8A82] mt-0.5">{t.sub}</span>
                {requiredTimeline === t.value && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold mt-1.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 4: Notes ──────────────────────────────────────────── */}
        <div className="card p-6">
          <SectionHeader
            number="4"
            icon={StickyNote}
            title="Additional Notes"
            subtitle="Optional — dimensions, colour, finishing, branding, special requirements"
          />
          <textarea
            className="input min-h-[100px] resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Genuine leather, tan colour, gold hardware, embossed logo on front pocket, dimensions 20cm × 12cm..."
          />
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-[#FAD5D0] bg-[#FFF5F4] px-4 py-3 text-sm text-danger">
            <X className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── CTA Card ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#C49A3C40] bg-gradient-to-br from-[#FFF8EA] to-[#FAF7F4] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C49A3C15] border border-[#C49A3C30]">
              <FlaskConical className="h-6 w-6 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink">Start with a Sample</h3>
              <p className="mt-1 text-sm text-[#5A4A44] leading-relaxed">
                Get a single unit produced first to validate quality, fit, and finish before committing to full production.
              </p>

              {/* Summary row */}
              {canSubmit && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white border border-[#E4D8CD] px-3 py-1 text-xs font-medium text-[#5A4A44]">
                    {productType}
                  </span>
                  <span className="rounded-full bg-white border border-[#E4D8CD] px-3 py-1 text-xs font-medium text-[#5A4A44]">
                    {quantity} units
                  </span>
                  <span className="rounded-full bg-white border border-[#E4D8CD] px-3 py-1 text-xs font-medium text-[#5A4A44]">
                    {requiredTimeline}
                  </span>
                  <span className="rounded-full bg-white border border-[#E4D8CD] px-3 py-1 text-xs font-medium text-[#5A4A44]">
                    {files.length} file{files.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button
                  variant="accent"
                  onClick={handleRequestSample}
                  disabled={!canSubmit}
                  className="w-full sm:w-auto"
                >
                  {`Request Sample · ${formatNaira(samplePrice)}`}
                </Button>
                {!canSubmit && (
                  <p className="text-xs text-[#9B8A82]">
                    Complete sections 1–3 above to continue.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

