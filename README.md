# Leddar Brand Frontend Prototype

This repository contains a complete frontend-only prototype for Leddar, a private B2B leather manufacturing platform for fashion brands.

No backend services, API integrations, or database calls are used. All UI state and content are driven from local mock data.

## Tech Stack

- Next.js (Pages Router, JavaScript only)
- React
- Tailwind CSS
- Lucide React (icons)

## Run The Project

The app is configured to run on port 3004 by default.

1. Install dependencies:

   npm install

2. Start development server:

   npm run dev

3. Open:

   http://localhost:3004

For production mode:

1. Build:

   npm run build

2. Start production server:

   npm run start

## Architecture Overview

The project follows a component-first architecture with clear separation between layout shell, reusable UI primitives, and domain-specific brand components.

### 1) Pages Layer

All route entry points live in pages. Each file maps directly to a URL.

- Marketing and auth pages:
  - pages/index.jsx
  - pages/login.jsx
  - pages/signup.jsx
  - pages/signup-confirmation.jsx
- Dashboard module pages:
  - pages/dashboard.jsx
  - pages/quote-request.jsx
  - pages/quote-response.jsx
  - pages/order-tracker.jsx
  - pages/sample-order.jsx
  - pages/invoices.jsx
  - pages/order-history.jsx
  - pages/kyc.jsx
  - pages/profile.jsx

### 2) Layout Layer

Shared dashboard structure is implemented in components/layout.

- components/layout/PageWrapper.jsx: wraps all dashboard pages with Sidebar + Topbar and content container.
- components/layout/Sidebar.jsx: central route navigation and active state styling.
- components/layout/Topbar.jsx: business context and notification area.

Design rule enforced: all dashboard pages render through PageWrapper so navigation and spacing stay consistent.

### 3) Reusable UI Primitives

Reusable low-level elements live in components/ui.

- components/ui/Button.jsx: button variants (primary, accent, outline, danger outline)
- components/ui/Badge.jsx: status badges with color mapping
- components/ui/StatCard.jsx: compact KPI card for dashboard metrics
- components/ui/Modal.jsx: generic modal shell for optional dialogs

These primitives keep page files clean and prevent style duplication.

### 4) Domain Components

Feature-level components live in components/brand.

- components/brand/QuoteForm.jsx
- components/brand/SampleInfoPage.jsx
- components/brand/OrderTrackerCard.jsx
- components/brand/InvoiceRow.jsx
- components/brand/NotificationBell.jsx

This layer holds business-specific UI patterns, while still reusing the generic UI primitives.

### 5) Data Layer (Mocked)

All hardcoded mock content is centralized in data/mockData.js.

This file includes:

- Sidebar link definitions
- Dashboard stats
- Recent activity rows
- Quote breakdown items
- Order summary and timeline
- Invoice rows
- Order history rows and type filters
- Sample flow information and step labels
- Product type options

Benefits:

- Single source of truth for prototype content
- Easy to swap with real API responses later
- Predictable page rendering with no side effects

## Styling System

### Tailwind Configuration

Custom brand palette is defined in tailwind.config.js:

- leather: #6B3A2A
- gold: #C49A3C
- cream: #FAF7F4
- espresso: #1C1412
- ink: #1A1A1A
- success: #2D6A4F

### Global Styles

styles/globals.css defines reusable visual utilities:

- Atmospheric background gradients
- Shared card styling
- Form input and label classes
- Page title and subtitle helper classes

This provides visual consistency while keeping JSX class lists manageable.

## How To Extend The Prototype

1. Add or update mock data in data/mockData.js.
2. Build new feature UIs in components/brand.
3. Reuse shared primitives from components/ui.
4. For dashboard routes, wrap page content in components/layout/PageWrapper.jsx.
5. Keep business copy and table rows mock-driven rather than inline where possible.

## Migration Path To Real Backend

When backend APIs are ready, migrate incrementally:

1. Replace data/mockData.js exports with API hooks one feature at a time.
2. Preserve component boundaries (layout/ui/brand) to reduce refactor cost.
3. Keep page routes unchanged so navigation and QA scripts remain stable.

## Notes

- This prototype is intentionally frontend-only.
- All current pages are statically renderable and compile through Next.js production build.
