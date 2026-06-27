# Leddar — Brand Portal

The brand-facing web application for the Leddar premium leather production platform. Brands request quotes, track sample production, approve sample videos, and pay for production.

**URL:** http://localhost:3004

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP Client | Axios |
| Payments | Paystack JS (inline checkout) |

---

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # add your API URL
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3004 |
| `npm run build` | Build for production |
| `npm start` | Start production server on port 3004 |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Project Structure

```
pages/
├── index.jsx                  # Login page
├── signup.jsx                 # Brand registration
├── dashboard.jsx              # Overview: active orders, quick stats
├── kyc.jsx                    # Identity verification (NIN + CAC via QoreID)
├── new-order.jsx              # Place a quote request
├── order-status.jsx           # Pricing, sample video review, pay button
├── order-tracker.jsx          # Live order status timeline
├── order-history/
│   └── [id].jsx               # Completed order details + approved video
├── sample-requests.jsx        # All sample orders
├── invoices.jsx               # Invoice list and downloads
└── profile.jsx                # Business profile

components/
├── brand/
│   ├── QuoteForm.jsx          # Quote request multi-step form
│   ├── SampleInfoPage.jsx     # Sample order detail view
│   └── OrderTrackerCard.jsx   # Status timeline card
├── layout/
│   ├── PageWrapper.jsx        # Dashboard shell (sidebar + topbar)
│   ├── Sidebar.jsx            # Navigation
│   └── Topbar.jsx             # Brand name + notifications
└── ui/
    ├── Button.jsx
    ├── Badge.jsx
    ├── Card.jsx
    ├── Modal.jsx
    └── StatCard.jsx

services/
├── apiClient.js               # Axios instance with JWT interceptors
└── brandService.js            # Quote, order, KYC, payment API calls

store/
└── slices/
    ├── authSlice.js
    ├── ordersSlice.js
    └── quotesSlice.js
```

---

## User Flow

```
Sign Up / Login
     ↓
Complete KYC (NIN + CAC verification — both required before ordering)
     ↓
Place Order → fill quote form + upload reference files
     ↓
Admin sets sample price → Brand receives notification
     ↓
My Quotes → review pricing → Pay Sample Fee (Paystack)
     ↓
Order Status → admin forwards sample video → Brand watches video
     ↓
Brand Approves  ──────────────────────────────────────────────┐
     or                                                       ↓
Brand Requests Changes → artisan re-uploads         Production pricing received
     ↓                                                        ↓
                                              Pay Production Balance (Paystack)
                                                              ↓
                                                   Track My Order → Delivered
```

---

## KYC Requirements

Before a brand can place any order, both verifications must pass:

| Step | What | Provider |
|---|---|---|
| NIN | National ID Number | QoreID `/nin-premium/{nin}` |
| CAC / RC Number | Business registration | QoreID `/cac/{rcNumber}` |

Both are verified once. A prompt appears on every login page until complete.

---

## Pages Reference

| Page | Route | What it does |
|---|---|---|
| Login | `/` | Brand authentication |
| Dashboard | `/dashboard` | Active orders, recent activity |
| My Quotes | `/order-status` | Pricing breakdown, sample video, pay button |
| Track My Order | `/order-tracker` | Live order timeline |
| Sample Orders | `/sample-requests` | All sample order history |
| Order History | `/order-history/[id]` | Delivered order + approved sample video |
| Payments & Invoices | `/invoices` | Payment history + PDF invoice downloads |
| Identity Verification | `/kyc` | NIN + CAC verification (required before ordering) |
| Profile & Settings | `/profile` | Update business profile |

---

## Payment Flow

1. **Sample flat fee** — brand pays after admin confirms pricing. Paystack inline checkout.
2. **Production balance** — brand pays after approving the sample. Amount = (materials + labour) × 1.075 VAT − sample credit.

Both payments go through Paystack. On success, Paystack calls the server webhook to advance the order status.

---

## Invoices

All invoices are generated server-side as PDF files with the Leddar logo embedded.

Filename format: `leddar-invoice-{INV-XXXXXXXX}.pdf`

Downloaded from the Payments & Invoices page.

---

## Testing

### Test Structure

```
__tests__/
└── services/
    ├── authService.test.js   # Login, logout, session persistence, token refresh
    └── paymentService.test.js # Paystack initialisation (sample + production),
                               #   payment verification, error handling
```

### Running Tests

```bash
# Run all tests
npm test

# Run a specific test file
npx jest __tests__/services/paymentService.test.js

# Run tests matching a name pattern
npx jest --testNamePattern="initialize"

# Watch mode (re-runs on file change)
npx jest --watch
```

Tests run in **jsdom** environment with **babel-jest**. The `apiClient` Axios instance is mocked — no real API calls or Paystack checkouts are triggered.

---

## Notes

- Sample video is only shown once admin approves and forwards it (not immediately on artisan upload).
- Approved sample video persists on the Order History page.
- VAT (7.5%) is shown in the payment confirmation modal, not duplicated on the quote card.
