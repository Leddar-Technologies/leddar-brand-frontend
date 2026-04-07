export const businessName = "Zara Couture";

export const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Order", href: "/new-order" },
  { label: "Order Status", href: "/order-status" },
  { label: "Order Tracker", href: "/order-tracker" },
  { label: "Sample Requests", href: "/sample-requests" },
  { label: "Payment & Invoices", href: "/invoices" },
  { label: "Order History", href: "/order-history" },
  { label: "Verification (KYC)", href: "/kyc" },
  { label: "Profile & Settings", href: "/profile" },
];

export const stats = [
  { label: "Active Orders", value: "3" },
  { label: "Pending Quotes", value: "1" },
  { label: "Total Orders", value: "12" },
];

export const recentActivity = [
  {
    date: "2026-03-28",
    type: "Quote",
    description: "Quote for 120 premium wallets submitted",
    status: "Pending",
  },
  {
    date: "2026-03-24",
    type: "Order",
    description: "Production started for belt collection",
    status: "In Progress",
  },
  {
    date: "2026-03-20",
    type: "Invoice",
    description: "Invoice INV-118 marked as paid",
    status: "Completed",
  },
  {
    date: "2026-03-18",
    type: "Sample",
    description: "Sample video uploaded for tote bag",
    status: "Completed",
  },
  {
    date: "2026-03-12",
    type: "KYC",
    description: "KYC verification initiated",
    status: "Pending",
  },
];

export const quoteBreakdown = [
  { item: "Materials", amount: "₦45,000" },
  { item: "Labour", amount: "₦25,000" },
  { item: "MOQ Note", amount: "50 units minimum" },
];

export const orderSummary = {
  orderId: "ORD-2307",
  productType: "Leather Wallet",
  quantity: 120,
  datePlaced: "2026-03-17",
  estimatedDelivery: "2026-04-18",
};

export const orderTimeline = [
  {
    date: "2026-03-18",
    title: "Quote Approved",
    note: "Brand approved pricing and proceeded to payment.",
  },
  {
    date: "2026-03-22",
    title: "Production Started",
    note: "Pattern cutting and stitching started at partner facility.",
  },
  {
    date: "2026-03-27",
    title: "In Production",
    note: "70% of units completed. Final quality checks underway.",
  },
];

export const invoices = [
  {
    orderId: "ORD-2001",
    product: "Leather Belt",
    date: "2026-02-12",
    amount: "₦60,000",
    vat: "₦4,500",
    total: "₦64,500",
    status: "Paid",
  },
  {
    orderId: "ORD-2067",
    product: "Premium Wallet",
    date: "2026-02-28",
    amount: "₦55,000",
    vat: "₦4,125",
    total: "₦59,125",
    status: "Paid",
  },
  {
    orderId: "ORD-2181",
    product: "Structured Tote",
    date: "2026-03-10",
    amount: "₦45,000",
    vat: "₦3,375",
    total: "₦48,375",
    status: "Pending",
  },
  {
    orderId: "ORD-2234",
    product: "Mini Sling Bag",
    date: "2026-03-18",
    amount: "₦40,000",
    vat: "₦3,000",
    total: "₦43,000",
    status: "Pending",
  },
];

export const orderHistory = [
  {
    id: "SO-1001",
    type: "Sample",
    product: "Bags",
    date: "2026-01-15",
    status: "Completed",
  },
  {
    id: "PO-1002",
    type: "Production",
    product: "Wallets",
    date: "2026-01-28",
    status: "Delivered",
  },
  {
    id: "SO-1003",
    type: "Sample",
    product: "Belts",
    date: "2026-02-06",
    status: "Completed",
  },
  {
    id: "PO-1004",
    type: "Production",
    product: "Shoes",
    date: "2026-02-17",
    status: "In Production",
  },
  {
    id: "PO-1005",
    type: "Production",
    product: "Accessories",
    date: "2026-03-01",
    status: "Shipped",
  },
  {
    id: "SO-1006",
    type: "Sample",
    product: "Wallets",
    date: "2026-03-14",
    status: "Pending",
  },
];

export const sampleInfoPoints = [
  "You pay a flat sample fee upfront (e.g. ₦30,000 for 1 piece)",
  "This fee is deducted from your full production total when you approve",
  "You will receive a video of the completed sample for review - no physical delivery",
  "You may request a maximum of 2 corrections on the sample",
  "Once you approve the sample, you pay only the balance to proceed to production",
];

export const sampleSteps = [
  {
    key: "requested",
    title: "Requested",
    note: "Sample request has been submitted.",
  },
  {
    key: "payment_confirmed",
    title: "Payment Confirmed",
    note: "Sample fee has been received.",
  },
  {
    key: "in_review",
    title: "In Review",
    note: "Team is reviewing the sample brief.",
  },
  {
    key: "sample_ready",
    title: "Sample Ready",
    note: "Sample is completed and ready for review.",
  },
  {
    key: "revisions_needed",
    title: "Revisions Needed",
    note: "Optional corrections can be requested.",
  },
  {
    key: "completed",
    title: "Completed",
    note: "Sample process is fully finished.",
  },
];

export const productTypes = [
  "Men Footwear",
  "Women Footwear",
  "Men Bags",
  "Women Bags",
  "Wallets & Small Goods",
  "Belts",
  "Custom Leather Products",
  "Not sure yet"
];
