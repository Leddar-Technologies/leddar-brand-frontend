import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ArrowUp, Menu, X } from "lucide-react";

const TOC = [
  { id: "s1",  num: 1,  title: "Introduction" },
  { id: "s2",  num: 2,  title: "Who These Terms Apply To" },
  { id: "s3",  num: 3,  title: "What LEDDAR Is" },
  { id: "s4",  num: 4,  title: "Eligibility" },
  { id: "s5",  num: 5,  title: "Account Registration" },
  { id: "s6",  num: 6,  title: "Verification & KYC" },
  { id: "s7",  num: 7,  title: "User Types & Roles" },
  { id: "s8",  num: 8,  title: "Platform Access & Approval" },
  { id: "s9",  num: 9,  title: "Brand Terms" },
  { id: "s10", num: 10, title: "Artisan Terms" },
  { id: "s11", num: 11, title: "Orders, Samples & Quotes" },
  { id: "s12", num: 12, title: "Pricing & Platform Fees" },
  { id: "s13", num: 13, title: "Payments & Third-Party" },
  { id: "s14", num: 14, title: "Invoices & Billing" },
  { id: "s15", num: 15, title: "Delivery & Shipping" },
  { id: "s16", num: 16, title: "Revisions & Scope Creep" },
  { id: "s17", num: 17, title: "Cancellations" },
  { id: "s18", num: 18, title: "Quality & Acceptance" },
  { id: "s19", num: 19, title: "Disputes Between Users" },
  { id: "s20", num: 20, title: "User Content" },
  { id: "s21", num: 21, title: "Intellectual Property" },
  { id: "s22", num: 22, title: "Confidentiality" },
  { id: "s23", num: 23, title: "Prohibited Conduct" },
  { id: "s24", num: 24, title: "Suspensions & Termination" },
  { id: "s25", num: 25, title: "Data Protection & Privacy" },
  { id: "s26", num: 26, title: "Platform Availability" },
  { id: "s27", num: 27, title: "Disclaimers" },
  { id: "s28", num: 28, title: "Limitation of Liability" },
  { id: "s29", num: 29, title: "Indemnity" },
  { id: "s30", num: 30, title: "Notices & Communications" },
  { id: "s31", num: 31, title: "Amendments" },
  { id: "s32", num: 32, title: "Governing Law" },
  { id: "s33", num: 33, title: "Dispute Resolution" },
  { id: "s34", num: 34, title: "Severability" },
  { id: "s35", num: 35, title: "Entire Agreement" },
  { id: "s36", num: 36, title: "Contact" },
];

function SectionHeading({ num, title }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-l-4 border-leather pl-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leather text-xs font-bold text-white">
        {num}
      </span>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
    </div>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="mb-2 mt-5 flex items-center gap-2 text-base font-semibold text-leather">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
      {children}
    </h3>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[#3C2F2A]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leather/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children, variant = "gold" }) {
  const styles = variant === "danger"
    ? "border-[#B42318] bg-[#B4231808]"
    : "border-gold bg-[#C49A3C12]";
  return (
    <div className={`my-4 rounded-r-xl border-l-4 px-5 py-4 text-sm text-[#3C2F2A] ${styles}`}>
      {children}
    </div>
  );
}

function NestedBulletList({ items }) {
  return (
    <ul className="ml-4 mt-1 space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[#3C2F2A]">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-leather/40" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsAndConditions() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeId, setActiveId] = useState("s1");
  const [showTop, setShowTop] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      setShowTop(window.scrollY > 500);
      const sections = document.querySelectorAll("section[id], div[id^='s']");
      let current = "s1";
      sections.forEach((el) => {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
      });
      setActiveId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  return (
    <div className="min-h-screen bg-atmosphere">
      {/* Reading progress bar */}
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-[#E8DED5]">
        <div
          className="h-full bg-gradient-to-r from-leather via-gold to-leather transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0.5 z-40 border-b border-[#E8DED5] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Image src="/leddar-logo.svg" alt="Leddar" width={160} height={50} className="h-10 w-auto" priority />
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-[#5A4A44] sm:inline">Premium Leather Manufacturing</span>
            <button
              className="flex items-center gap-1.5 rounded-lg border border-[#E8DED5] px-3 py-1.5 text-xs font-medium text-[#5A4A44] hover:bg-cream lg:hidden"
              onClick={() => setTocOpen(!tocOpen)}
            >
              {tocOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
              Contents
            </button>
          </div>
        </div>

        {tocOpen && (
          <div className="border-t border-[#E8DED5] bg-white px-4 py-4 lg:hidden">
            <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
              {TOC.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                    activeId === item.id ? "bg-leather/10 text-leather font-medium" : "text-[#5A4A44] hover:bg-cream"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    activeId === item.id ? "bg-leather text-white" : "bg-[#E8DED5] text-[#5A4A44]"
                  }`}>
                    {item.num}
                  </span>
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <div className="flex gap-8 lg:gap-12">

          {/* Sidebar TOC */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-[#E8DED5] bg-white p-4 shadow-card">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#8A7A72]">Contents</p>
              <nav className="space-y-0.5">
                {TOC.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                      activeId === item.id ? "bg-leather/10 text-leather font-semibold" : "text-[#5A4A44] hover:bg-cream"
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                      activeId === item.id ? "bg-leather text-white" : "bg-[#F0E8E0] text-[#8A7A72]"
                    }`}>
                      {item.num}
                    </span>
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <Link href="/signup" className="mb-6 inline-flex items-center gap-1.5 text-sm text-leather hover:text-[#5A2F22] transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Signup
            </Link>

            {/* Hero */}
            <div className="mb-8 rounded-2xl border border-[#E8DED5] bg-white px-8 py-8 shadow-card">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-leather/10 px-3 py-1 text-xs font-semibold text-leather">
                <span className="h-1.5 w-1.5 rounded-full bg-leather" />
                Legal Document
              </div>
              <h1 className="mb-4 text-4xl font-bold text-ink">Terms &amp; Conditions</h1>
              <div className="flex flex-wrap gap-3">
                {[["Effective", "May 1, 2026"], ["Version", "v1.0.0.0"], ["Platform", "LEDDAR"], ["Operator", "Leddar Systems Limited"]].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#E8DED5] bg-cream px-3 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#8A7A72]">{label}</span>
                    <p className="text-xs font-medium text-ink">{value}</p>
                  </div>
                ))}
                <div className="rounded-lg border border-[#E8DED5] bg-cream px-3 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#8A7A72]">Website</span>
                  <p className="text-xs font-medium">
                    <a href="https://www.myleddar.com" className="text-leather underline hover:text-[#5A2F22]">www.myleddar.com</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s1" className="scroll-mt-24">
                  <SectionHeading num={1} title="Introduction" />
                  <p className="mb-3 text-[#3C2F2A]">
                    These Terms &amp; Conditions govern access to and use of the LEDDAR platform, including its
                    website, dashboards, forms, messaging tools, production request tools, sample request tools,
                    payment flows, verification flows, and related services.
                  </p>
                  <p className="text-[#3C2F2A]">
                    By creating an account, applying for access, submitting a request, accepting work, uploading
                    documents, making payment, or otherwise using LEDDAR, you agree to be bound by these Terms.
                    If you do not agree, do not use the platform.
                  </p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s2" className="scroll-mt-24">
                  <SectionHeading num={2} title="Who These Terms Apply To" />
                  <p className="mb-3 text-[#3C2F2A]">These Terms apply to all users of LEDDAR, including:</p>
                  <div className="space-y-2.5">
                    {[
                      ["Brands", "businesses, founders, consultants, retailers, and other buyers seeking leather production or related manufacturing services."],
                      ["Artisans", "independent makers, workshops, production experts, and manufacturing partners who perform work through the platform."],
                      ["Visitors", "anyone browsing or interacting with the platform before registration."],
                    ].map(([label, desc]) => (
                      <div key={label} className="flex gap-3 rounded-xl bg-cream p-3">
                        <span className="mt-0.5 shrink-0 font-semibold text-leather text-sm">{label}:</span>
                        <span className="text-sm text-[#3C2F2A]">{desc}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s3" className="scroll-mt-24">
                  <SectionHeading num={3} title="What LEDDAR Is" />
                  <p className="mb-3 text-[#3C2F2A]">LEDDAR is a technology platform that helps users:</p>
                  <BulletList items={["submit and manage production requests", "request and review samples", "discover and work with verified artisans", "track production progress", "manage selected payments and records", "complete verification and compliance steps", "communicate within a structured workflow"]} />
                  <p className="mt-3 mb-2 text-[#3C2F2A]">LEDDAR is not:</p>
                  <BulletList items={["the manufacturer of goods", "the employer of any artisan", "an agent of any user unless expressly stated in writing", "a financial institution, bank, or payment processor"]} />
                  <p className="mt-3 text-[#3C2F2A]">
                    Where payments are processed on the platform, they are processed through third-party payment
                    providers selected by LEDDAR. The Central Bank of Nigeria maintains lists of licensed payment
                    operators and processors.
                  </p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s4" className="scroll-mt-24">
                  <SectionHeading num={4} title="Eligibility" />
                  <p className="mb-3 text-[#3C2F2A]">To use LEDDAR, you must:</p>
                  <BulletList items={["be at least 18 years old", "have legal capacity to enter into binding contracts", "provide accurate and complete information", "use the platform only for lawful business purposes"]} />
                  <p className="mt-3 text-[#3C2F2A]">If you are signing up on behalf of a company or business, you confirm that you are authorized to bind that entity.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s5" className="scroll-mt-24">
                  <SectionHeading num={5} title="Account Registration" />
                  <p className="mb-3 text-[#3C2F2A]">To access LEDDAR, users may be required to create an account or apply for access. You agree to:</p>
                  <BulletList items={["provide current, accurate, and complete information", "keep your login credentials secure", "notify LEDDAR promptly of any unauthorized use", "update your information when it changes"]} />
                  <p className="mt-3 text-[#3C2F2A]">
                    You are responsible for all activity under your account unless caused by LEDDAR&apos;s own fault.
                    LEDDAR may reject, suspend, restrict, or remove any account if information provided is false,
                    incomplete, misleading, unlawful, or creates compliance or platform risk.
                  </p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s6" className="scroll-mt-24">
                  <SectionHeading num={6} title="Verification and KYC" />
                  <p className="mb-3 text-[#3C2F2A]">LEDDAR may require identity, business, and compliance checks before certain actions, including:</p>
                  <BulletList items={["requesting pricing", "paying deposits", "requesting samples", "proceeding to production", "receiving payouts", "accessing certain platform features"]} />
                  <p className="mt-3 mb-2 text-[#3C2F2A]">Verification may include:</p>
                  <BulletList items={["personal identification", "business details", "phone and email verification", "bank account validation", "any additional checks reasonably required for trust, fraud prevention, or legal compliance"]} />
                  <p className="mt-3 text-[#3C2F2A]">
                    LEDDAR may use third-party verification providers for this process. Failure to complete required
                    verification may result in restricted access, delayed transactions, inability to proceed with
                    orders, or account suspension.
                  </p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s7" className="scroll-mt-24">
                  <SectionHeading num={7} title="User Types and Specific Roles" />
                  <SubHeading>7.1 Brands</SubHeading>
                  <p className="text-[#3C2F2A]">Brands use LEDDAR to request samples, request production pricing, place production requests, track orders, review outputs, and make payments.</p>
                  <SubHeading>7.2 Artisans</SubHeading>
                  <p className="text-[#3C2F2A]">Artisans use LEDDAR to receive opportunities, accept assignments, perform production work, provide updates, submit samples or outputs, and receive payments where applicable.</p>
                  <SubHeading>7.3 No Employment Relationship</SubHeading>
                  <p className="text-[#3C2F2A]">Artisans are independent contractors or independent business operators. Nothing in these Terms creates an employment, partnership, agency, joint venture, or fiduciary relationship between LEDDAR and any artisan.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s8" className="scroll-mt-24">
                  <SectionHeading num={8} title="Platform Access and Approval" />
                  <p className="mb-3 text-[#3C2F2A]">LEDDAR may operate as an approval-based platform. Access is not automatic. LEDDAR may:</p>
                  <BulletList items={["approve or reject applications", "restrict certain features until verification is complete", "grant, suspend, or remove access based on quality, trust, compliance, performance, fraud risk, or business reasons"]} />
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s9" className="scroll-mt-24">
                  <SectionHeading num={9} title="Brand Terms" />
                  <SubHeading>9.1 Accuracy of Requests</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">You must provide clear, accurate, and complete production information, including where relevant:</p>
                  <BulletList items={["product type", "quantity", "reference files", "dimensions", "materials", "timelines", "quality expectations", "branding and finishing details"]} />
                  <p className="mt-2 text-[#3C2F2A]">You are responsible for delays, errors, or quality issues caused by incomplete or incorrect instructions.</p>

                  <SubHeading>9.2 Samples</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">Where LEDDAR offers a sample-first process:</p>
                  <BulletList items={["sample fees must be paid before the sample workflow begins", "sample terms shown at checkout or on the relevant page apply", "sample approval may be required before full production", "revisions may be limited", "physical delivery of samples may or may not be included depending on the stated process"]} />

                  <SubHeading>9.3 Quotes and Pricing</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">Quotes issued through LEDDAR are based on the information provided and may be subject to:</p>
                  <BulletList items={["validity periods", "quantity assumptions", "material assumptions", "revision if scope changes", "additional costs for urgent delivery, added complexity, or new requirements"]} />
                  <p className="mt-2 text-[#3C2F2A]">A quote is not an obligation to begin work until all required approvals and payments have been completed.</p>

                  <SubHeading>9.4 Production Requests</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">A production request becomes active only when all required conditions are met, which may include:</p>
                  <BulletList items={["quote acceptance", "verification completion", "required payment or deposit", "any requested clarification"]} />

                  <SubHeading>9.5 Reviews and Approvals</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">Brands must review samples, updates, outputs, or milestones promptly. If a Brand delays review or approval unreasonably, LEDDAR may:</p>
                  <BulletList items={["mark the item as pending Brand action", "pause timelines", "delay production progress", "treat silence after a defined review period as acceptance where the workflow or order terms expressly allow it"]} />

                  <SubHeading>9.6 Payments by Brands</SubHeading>
                  <Callout>
                    <p className="mb-1 font-semibold text-ink">Brand-side Transaction Fee: 20%</p>
                    <p className="mb-2 text-[#3C2F2A]">A Brand acknowledges that LEDDAR&apos;s transaction fee includes a 20% Brand-side fee on eligible production transactions unless otherwise stated in writing or on the platform.</p>
                    <p className="text-[#3C2F2A]">Failure to make required payment may delay, pause, or cancel production.</p>
                  </Callout>

                  <SubHeading>9.7 No Off-Platform Circumvention</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">A Brand must not use LEDDAR to identify an artisan and then bypass the platform to transact directly where the relationship originated through LEDDAR, for a period of 12 months from first introduction, unless LEDDAR gives written consent.</p>
                  <p className="mb-2 text-[#3C2F2A]">If a Brand circumvents LEDDAR, LEDDAR may:</p>
                  <BulletList items={["suspend the account", "block future access", "charge platform fees that would have been earned", "pursue any legal remedy available"]} />
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s10" className="scroll-mt-24">
                  <SectionHeading num={10} title="Artisan Terms" />
                  <SubHeading>10.1 Independent Status</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">You act as an independent contractor or business. You are responsible for your own:</p>
                  <BulletList items={["taxes", "staff", "tools", "workspace", "production methods", "legal compliance"]} />

                  <SubHeading>10.2 Accuracy of Profile</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">You must keep your artisan profile accurate, including:</p>
                  <BulletList items={["capabilities", "specialties", "sample work", "location", "capacity", "timelines", "availability", "verification status"]} />

                  <SubHeading>10.3 Acceptance of Work</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">You must not accept work you cannot deliver. By accepting a request or assignment, you confirm that you can meet the agreed:</p>
                  <BulletList items={["specifications", "quantity", "quality level", "production timeline"]} />

                  <SubHeading>10.4 Quality and Standards</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">You must perform work in a professional manner and in line with:</p>
                  <BulletList items={["the approved brief", "the agreed sample", "any quality standard communicated through the platform", "lawful and safe production practices"]} />

                  <SubHeading>10.5 Updates and Communication</SubHeading>
                  <p className="text-[#3C2F2A]">You must provide timely and honest updates through the platform and respond reasonably to requests for clarification.</p>

                  <SubHeading>10.6 Delays and Issues</SubHeading>
                  <p className="text-[#3C2F2A]">If you foresee a delay, defect, shortage, or problem, you must notify LEDDAR and the Brand promptly through the platform. Failure to disclose material issues may affect payments, future assignments, or account standing.</p>

                  <SubHeading>10.7 Payments to Artisans</SubHeading>
                  <Callout>
                    <p className="mb-1 font-semibold text-ink">Artisan-side Platform Fee: 10%</p>
                    <p className="mb-2 text-[#3C2F2A]">The Artisan acknowledges that LEDDAR applies a 10% Artisan-side platform fee on eligible production transactions unless otherwise stated in writing or on the platform. Such fee may be deducted directly from amounts otherwise payable to the Artisan.</p>
                    <p className="font-medium text-ink mb-1">Payout structure (eligible production orders):</p>
                    <ul className="space-y-1 text-[#3C2F2A]">
                      <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />35% first tranche — to commence production</li>
                      <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />35% second tranche — upon completion of production</li>
                    </ul>
                  </Callout>
                  <p className="mt-2 text-[#3C2F2A]">LEDDAR may delay, suspend, adjust, or withhold payout where there is a payment failure, suspected fraud, compliance concern, dispute, scope issue, or other valid platform reason.</p>

                  <SubHeading>10.8 No Off-Platform Circumvention</SubHeading>
                  <p className="text-[#3C2F2A]">An Artisan must not use LEDDAR to access Brand opportunities and then move the relationship off-platform where the introduction originated through LEDDAR, for a period of 12 months, unless LEDDAR gives written consent. If an Artisan circumvents LEDDAR, LEDDAR may suspend the account, withhold unpaid platform-enabled opportunities where legally permitted, charge lost fees, and pursue any legal remedy available.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s11" className="scroll-mt-24">
                  <SectionHeading num={11} title="Orders, Samples, Quotes, and Production" />
                  <p className="mb-2 text-[#3C2F2A]">LEDDAR may support one or more of the following workflows:</p>
                  <BulletList items={["sample-only", "quote-only", "sample to production", "direct production", "milestone-based production"]} />
                  <p className="mt-3 mb-2 text-[#3C2F2A]">The exact workflow for any request depends on the product, category, user status, and platform process in force at the time. LEDDAR may set rules on:</p>
                  <BulletList items={["sample fees", "deposit requirements", "number of revisions", "response deadlines", "milestone approvals", "delivery conditions", "file submission formats", "acceptable product categories"]} />
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s12" className="scroll-mt-24">
                  <SectionHeading num={12} title="Pricing, Platform Fees, and Taxes" />
                  <Callout>
                    <p className="mb-2 font-semibold text-ink">Total Platform Transaction Fee: 30%</p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span className="text-[#3C2F2A]"><strong>20%</strong> charged on the Brand side as part of the total production payment made through the platform.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span className="text-[#3C2F2A]"><strong>10%</strong> charged on the Artisan side and deducted from the Artisan&apos;s production payout.</span>
                      </div>
                    </div>
                  </Callout>
                  <p className="mb-3 text-[#3C2F2A]">Unless otherwise stated for a specific order, the remaining production value payable to the Artisan shall be structured as follows:</p>
                  <BulletList items={[
                    "35% as the first tranche to commence production, after all required approvals, verification checks, and payment conditions have been satisfied.",
                    "35% upon completion of production, subject to the applicable workflow, confirmation of completion, and any required quality review or acceptance process.",
                  ]} />
                  <p className="mt-3 mb-2 text-[#3C2F2A]">For clarity:</p>
                  <BulletList items={[
                    "the total transaction value for a qualifying production order is allocated across the Brand payment, LEDDAR fee, and Artisan payout according to the platform pricing structure in force at the time of the order;",
                    "LEDDAR may deduct its platform fee before disbursing funds to the Artisan;",
                    "taxes, payment processing charges, and other applicable charges may be shown separately where required;",
                    "LEDDAR may revise fee structures from time to time, provided such revisions are disclosed before the relevant transaction is confirmed.",
                  ]} />
                  <p className="mt-3 text-[#3C2F2A]">All prices may be stated exclusive or inclusive of VAT or other taxes, as indicated on the platform or invoice. Users are responsible for taxes applicable to their own business unless the law requires otherwise.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s13" className="scroll-mt-24">
                  <SectionHeading num={13} title="Payments and Third-Party Providers" />
                  <p className="mb-3 text-[#3C2F2A]">Where a production order proceeds through the platform, payment may be collected and administered according to the applicable production workflow. For qualifying production orders:</p>
                  <BulletList items={[
                    "the Brand may be required to make payment through the platform before production begins;",
                    "the first Artisan tranche may be released only after all required preconditions are satisfied, including order confirmation, verification status, and any required deposit or payment confirmation;",
                    "the second Artisan tranche may be released only after production completion and satisfaction of the relevant completion conditions under the platform workflow;",
                    "LEDDAR may hold, route, deduct, delay, suspend, or reverse amounts as reasonably required for fraud prevention, failed payment, compliance review, platform fee deductions, or other lawful platform controls.",
                  ]} />
                  <p className="mt-3 text-[#3C2F2A]">LEDDAR is not a bank or financial institution and does not provide regulated banking services. Payment processing is handled through third-party payment providers.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s14" className="scroll-mt-24">
                  <SectionHeading num={14} title="Invoices, Billing, and Records" />
                  <p className="text-[#3C2F2A]">LEDDAR may issue invoices, receipts, summaries, or payment records through the platform. Users are responsible for reviewing invoices and raising any billing question within 7 days of issue. If no issue is raised within that period, the invoice or record may be treated as accepted, except in cases of clear fraud or manifest error.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s15" className="scroll-mt-24">
                  <SectionHeading num={15} title="Delivery, Shipping, and Logistics" />
                  <p className="mb-3 text-[#3C2F2A]">Unless expressly stated otherwise, LEDDAR is not the shipping carrier and does not itself transport goods. LEDDAR may:</p>
                  <BulletList items={["facilitate updates", "record shipping milestones", "help coordinate logistics", "integrate logistics partners later"]} />
                  <p className="mt-3 text-[#3C2F2A]">Delivery risk, timelines, carrier performance, and freight terms should be stated in the relevant order workflow or separately agreed.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s16" className="scroll-mt-24">
                  <SectionHeading num={16} title="Revisions, Changes, and Scope Creep" />
                  <p className="mb-3 text-[#3C2F2A]">If a Brand changes scope after quote approval or after work has started, LEDDAR or the Artisan may:</p>
                  <BulletList items={["revise pricing", "revise timelines", "require a new sample", "pause work until approval is received"]} />
                  <p className="mt-3 mb-2 text-[#3C2F2A]">A revision request is not the same as a complete redesign. LEDDAR may define what counts as:</p>
                  <BulletList items={["minor correction", "permitted revision", "scope change", "new request"]} />
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s17" className="scroll-mt-24">
                  <SectionHeading num={17} title="Cancellations" />
                  <SubHeading>17.1 By Brands</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">A Brand may cancel only as permitted by the applicable workflow and before certain stages of work have begun. If a Brand cancels:</p>
                  <BulletList items={["deposits or sample fees may be non-refundable", "work already performed may still be chargeable", "purchased materials may still be payable", "platform fees may still apply where clearly disclosed"]} />

                  <SubHeading>17.2 By Artisans</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">An Artisan may not cancel accepted work without valid reason. If an Artisan cancels:</p>
                  <BulletList items={["account standing may be affected", "future opportunities may be restricted", "any advance payment consequences will be handled under the relevant workflow and law"]} />

                  <SubHeading>17.3 By LEDDAR</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">LEDDAR may pause or cancel a request or account where necessary for:</p>
                  <BulletList items={["fraud prevention", "legal compliance", "safety", "abusive conduct", "payment failure", "severe quality concerns", "repeated breach of these Terms"]} />

                  <SubHeading>17.4 Effect of Cancellation on Tranche Payments</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">If a production order is canceled after the first Artisan tranche has been released:</p>
                  <BulletList items={[
                    "the first tranche may be treated as earned to the extent work has commenced or materials have been committed;",
                    "the second tranche shall not become payable unless the completion conditions are satisfied;",
                    "LEDDAR may deduct applicable fees, costs, or offsets before any refund or balance reconciliation is made.",
                  ]} />
                  <p className="mt-2 text-[#3C2F2A]">If cancellation occurs before production commences, any refund or reversal shall be handled according to the applicable workflow, disclosed fees, and payment provider rules.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s18" className="scroll-mt-24">
                  <SectionHeading num={18} title="Quality, Acceptance, and Defects" />
                  <p className="mb-3 text-[#3C2F2A]">LEDDAR may provide workflow tools for review, acceptance, and issue reporting. Unless otherwise stated for a particular order:</p>
                  <BulletList items={[
                    "Brands must inspect and review samples or delivered goods promptly",
                    "acceptance may occur through express approval or use of the goods",
                    "reported defects must be specific and documented",
                    "cosmetic variation inherent in handcrafted work may not always constitute a defect if within the agreed standard",
                  ]} />
                  <p className="mt-3 text-[#3C2F2A]">LEDDAR may assist communication and workflow handling, but does not guarantee that every dispute will result in a refund, remake, or approval.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s19" className="scroll-mt-24">
                  <SectionHeading num={19} title="Disputes Between Users" />
                  <p className="mb-3 text-[#3C2F2A]">Where LEDDAR offers dispute support, it may request evidence from both sides and make platform-level decisions about workflow status, visibility, or next actions. LEDDAR may consider:</p>
                  <BulletList items={["briefs and approved specifications", "sample approval status", "uploaded files", "timeline records", "platform messages", "production updates", "payment records", "delivery records", "any other relevant material"]} />
                  <p className="mt-3 text-[#3C2F2A]">LEDDAR&apos;s role in a dispute is operational and platform-based. Unless the law requires otherwise, it is not acting as a court, arbitrator, or insurer.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s20" className="scroll-mt-24">
                  <SectionHeading num={20} title="User Content and Uploaded Materials" />
                  <p className="mb-2 text-[#3C2F2A]">Users may upload:</p>
                  <BulletList items={["designs", "specifications", "logos", "text", "measurements", "product images", "videos", "production updates", "messages"]} />
                  <p className="mt-3 text-[#3C2F2A]">You remain responsible for what you upload. You confirm that you have the right to use and share all content uploaded to LEDDAR. You grant LEDDAR a non-exclusive license to host, store, process, display, and use such content as necessary to operate the platform.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s21" className="scroll-mt-24">
                  <SectionHeading num={21} title="Intellectual Property" />
                  <SubHeading>21.1 LEDDAR IP</SubHeading>
                  <p className="mb-2 text-[#3C2F2A]">All rights in the LEDDAR platform, including software, workflows, branding, interface design, and operating logic, belong to LEDDAR or its licensors. You may not:</p>
                  <BulletList items={["copy the platform", "reverse engineer it", "scrape or extract data improperly", "create derivative tools from it", "misuse its content or branding"]} />
                  <SubHeading>21.2 User IP</SubHeading>
                  <p className="text-[#3C2F2A]">Brands retain ownership of their designs and materials, except to the extent they grant rights needed for platform operation and production execution. Artisans retain ownership of their pre-existing know-how, techniques, and general methods, but not of any Brand-owned design or confidential material.</p>
                  <SubHeading>21.3 Feedback</SubHeading>
                  <p className="text-[#3C2F2A]">If you give LEDDAR suggestions or feedback, LEDDAR may use them without restriction or payment.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s22" className="scroll-mt-24">
                  <SectionHeading num={22} title="Confidentiality" />
                  <p className="mb-2 text-[#3C2F2A]">Users must treat non-public commercial and technical information received through LEDDAR as confidential, including:</p>
                  <BulletList items={["designs", "specs", "pricing", "customer lists", "samples", "process details", "internal messages"]} />
                  <p className="mt-3 text-[#3C2F2A]">You must not disclose or misuse another user&apos;s confidential information without authority.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s23" className="scroll-mt-24">
                  <SectionHeading num={23} title="Platform Rules and Prohibited Conduct" />
                  <p className="mb-3 text-[#3C2F2A]">You must not:</p>
                  <BulletList items={[
                    "provide false information",
                    "impersonate any person or business",
                    "misuse another user's documents or designs",
                    "upload unlawful, infringing, or harmful content",
                    "interfere with platform security",
                    "use the platform to harass, threaten, or defraud",
                    "bypass LEDDAR to avoid fees",
                    "attempt to manipulate reviews, records, or payment status",
                    "use bots, scripts, or scraping tools without permission",
                  ]} />
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s24" className="scroll-mt-24">
                  <SectionHeading num={24} title="Suspensions, Restrictions, and Termination" />
                  <p className="mb-3 text-[#3C2F2A]">LEDDAR may suspend, restrict, or terminate access if:</p>
                  <BulletList items={["you breach these Terms", "you fail verification", "you create legal, financial, or reputational risk", "you engage in fraud, abuse, or circumvention", "you repeatedly fail to meet platform standards"]} />
                  <p className="mt-3 text-[#3C2F2A]">LEDDAR may also preserve records, block certain features, or keep certain account data where reasonably necessary for compliance, dispute handling, security, or legal obligations.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s25" className="scroll-mt-24">
                  <SectionHeading num={25} title="Data Protection and Privacy" />
                  <p className="mb-3 text-[#3C2F2A]">
                    LEDDAR processes personal data in connection with account setup, verification, production workflows,
                    communications, and payment-related activities. Nigeria&apos;s Data Protection Act 2023 established the
                    NDPC and provides for lawful, fair, and accountable processing of personal data, along with data
                    subject rights.
                  </p>
                  <p className="mb-2 text-[#3C2F2A]">By using LEDDAR, you acknowledge that:</p>
                  <BulletList items={[
                    "your data may be processed to provide platform services",
                    "your data may be shared with service providers involved in verification, hosting, messaging, analytics, or payment processing",
                    "your data may be processed on lawful bases such as contract, consent, or legal obligation, as applicable",
                  ]} />
                  <p className="mt-3 text-[#3C2F2A]">Your privacy rights and our detailed data handling rules should be set out in LEDDAR&apos;s Privacy Policy, which forms part of the platform&apos;s legal framework.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s26" className="scroll-mt-24">
                  <SectionHeading num={26} title="Availability and Changes to the Platform" />
                  <p className="text-[#3C2F2A]">LEDDAR may update, improve, suspend, or remove features at any time. LEDDAR does not guarantee that the platform will always be uninterrupted, error-free, or available on every device or network.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s27" className="scroll-mt-24">
                  <SectionHeading num={27} title="Disclaimers" />
                  <p className="mb-3 text-[#3C2F2A]">To the maximum extent permitted by law:</p>
                  <BulletList items={[
                    "the platform is provided on an \"as is\" and \"as available\" basis",
                    "LEDDAR does not guarantee uninterrupted service",
                    "LEDDAR does not guarantee that every request will receive a quote, sample, match, or successful production outcome",
                    "LEDDAR does not guarantee that every user is suitable for every project",
                    "LEDDAR is not responsible for business losses arising solely from another user's failure to perform, except to the extent caused by LEDDAR's own breach or legal responsibility",
                  ]} />
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s28" className="scroll-mt-24">
                  <SectionHeading num={28} title="Limitation of Liability" />
                  <Callout variant="danger">
                    To the fullest extent permitted by law, LEDDAR shall not be liable for indirect, incidental,
                    consequential, special, or punitive damages, including loss of profit, revenue, goodwill,
                    opportunity, or data.
                  </Callout>
                  <p className="mb-3 text-[#3C2F2A]">
                    LEDDAR&apos;s aggregate liability for any claim arising out of or relating to the platform shall not
                    exceed the total fees paid by the claimant to LEDDAR in the 3 months preceding the event giving
                    rise to the claim, except where the law does not permit such limitation.
                  </p>
                  <p className="text-[#3C2F2A]">Nothing in these Terms excludes liability that cannot lawfully be excluded.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s29" className="scroll-mt-24">
                  <SectionHeading num={29} title="Indemnity" />
                  <p className="mb-3 text-[#3C2F2A]">You agree to indemnify and hold harmless LEDDAR, its affiliates, directors, officers, employees, and agents from claims, losses, costs, and expenses arising from:</p>
                  <BulletList items={["your breach of these Terms", "your misuse of the platform", "your infringement of another person's rights", "your unlawful, fraudulent, or negligent conduct", "disputes caused by your false instructions, false content, or undisclosed defects"]} />
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s30" className="scroll-mt-24">
                  <SectionHeading num={30} title="Notices and Communications" />
                  <p className="mb-2 text-[#3C2F2A]">LEDDAR may send notices by:</p>
                  <BulletList items={["email", "dashboard notification", "SMS", "WhatsApp", "website posting", "any other contact method you provide"]} />
                  <p className="mt-3 text-[#3C2F2A]">You are responsible for keeping your contact details current.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s31" className="scroll-mt-24">
                  <SectionHeading num={31} title="Amendments" />
                  <p className="text-[#3C2F2A]">LEDDAR may update these Terms from time to time. Where changes are material, LEDDAR may provide notice through the platform or by email. Continued use after the effective date of updated Terms constitutes acceptance.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s32" className="scroll-mt-24">
                  <SectionHeading num={32} title="Governing Law" />
                  <p className="text-[#3C2F2A]">These Terms shall be governed by the laws of the Federal Republic of Nigeria.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s33" className="scroll-mt-24">
                  <SectionHeading num={33} title="Dispute Resolution Between You and LEDDAR" />
                  <p className="text-[#3C2F2A]">Before filing a formal claim, you agree to first contact LEDDAR and attempt to resolve the issue in good faith. Any dispute between you and LEDDAR that is not resolved informally shall be submitted to the courts of competent jurisdiction in Nigeria, unless LEDDAR specifies arbitration in a separate signed agreement.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s34" className="scroll-mt-24">
                  <SectionHeading num={34} title="Severability" />
                  <p className="text-[#3C2F2A]">If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
                </section>
              </div>

              <div className="rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <section id="s35" className="scroll-mt-24">
                  <SectionHeading num={35} title="Entire Agreement" />
                  <p className="text-[#3C2F2A]">These Terms, together with any incorporated policies, pricing disclosures, workflow rules, Privacy Policy, and any order-specific terms expressly adopted on the platform, form the entire agreement between you and LEDDAR regarding platform use.</p>
                </section>
              </div>

              {/* Contact */}
              <div id="s36" className="scroll-mt-24 rounded-2xl border border-[#E8DED5] bg-white px-8 py-7 shadow-card">
                <SectionHeading num={36} title="Contact" />
                <p className="mb-5 text-[#3C2F2A]">For legal notices or support, contact:</p>
                <div className="rounded-xl border border-[#E8DED5] bg-cream p-5">
                  <p className="mb-3 font-semibold text-ink">LEDDAR — Leddar Systems Limited</p>
                  <div className="space-y-2 text-sm text-[#3C2F2A]">
                    {[
                      ["345 Odusami Street, Ogba, Lagos", null],
                      ["Alfred.j@myleddar.com", "mailto:Alfred.j@myleddar.com"],
                      ["Support@myleddar.com", "mailto:Support@myleddar.com"],
                      ["+2349067688122", "tel:+2349067688122"],
                    ].map(([text, href]) => (
                      <div key={text} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-leather/60 shrink-0" />
                        {href ? <a href={href} className="text-leather underline hover:text-[#5A2F22]">{text}</a> : <span>{text}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer nav */}
              <div className="flex items-center justify-between rounded-2xl border border-[#E8DED5] bg-white px-6 py-4 shadow-card">
                <Link href="/signup" className="flex items-center gap-1.5 text-sm text-leather hover:text-[#5A2F22] transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Signup
                </Link>
                <Link href="/privacy-policy" className="text-sm text-leather underline hover:text-[#5A2F22] transition-colors">
                  ← View Privacy Policy
                </Link>
              </div>

            </div>
          </main>
        </div>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-leather text-white shadow-lg hover:bg-[#5A2F22] transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
