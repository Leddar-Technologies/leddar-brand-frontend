import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-atmosphere">
      <header className="border-b border-[#E8DED5] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Image
              src="/leddar-logo.svg"
              alt="Leddar"
              width={180}
              height={56}
              className="h-12 w-auto"
              priority
            />
          </div>
          <div className="hidden text-xs text-[#5A4A44] sm:inline sm:text-sm lg:text-sm">
            Premium Leather Manufacturing
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/signup"
          className="mb-8 inline-flex items-center gap-2 text-leather hover:text-[#5A2F22]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Signup
        </Link>

        <div className="rounded-2xl border border-[#E8DED5] bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-4xl font-bold text-ink">Privacy Policy</h1>
          <p className="mb-8 text-sm text-[#5A4A44]">
            Last updated: April 2026
          </p>

          <div className="prose max-w-none space-y-6 text-[#3C2F2A]">
            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                1. Introduction
              </h2>
              <p>
                LEDDAR ("we" or "us" or "our") operates the LEDDAR website (the
                "Site"). This page informs you of our policies regarding the
                collection, use, and disclosure of personal data when you use
                our Site and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                2. Information Collection and Use
              </h2>
              <p>
                We collect several different types of information for various
                purposes to provide and improve our Service to you.
              </p>
              <h3 className="mt-4 font-semibold text-ink">
                Types of Data Collected:
              </h3>
              <ul className="ml-6 space-y-2">
                <li>
                  <strong>Personal Data:</strong> While using our Site, we may
                  ask you to provide us with certain personally identifiable
                  information that can be used to contact or identify you
                  ("Personal Data"). This may include, but is not limited to:
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>- Email address</li>
                    <li>- First and last name</li>
                    <li>- Phone number</li>
                    <li>- Cookies and Usage Data</li>
                  </ul>
                </li>
                <li>
                  <strong>Usage Data:</strong> We may also collect information
                  on how the Site is accessed and used ("Usage Data"). This may
                  include information such as your computer's Internet Protocol
                  address, browser type, browser version, the pages you visit,
                  the time and date of your visit, and other diagnostic data.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                3. Use of Data
              </h2>
              <p>LEDDAR uses the collected data for various purposes:</p>
              <ul className="ml-6 space-y-2">
                <li>- To provide and maintain our Site</li>
                <li>- To notify you about changes to our Site</li>
                <li>- To allow you to participate in interactive features</li>
                <li>- To provide customer support</li>
                <li>
                  - To gather analysis or valuable information to improve our
                  Site
                </li>
                <li>- To monitor the usage of our Site</li>
                <li>- To detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                4. Security of Data
              </h2>
              <p>
                The security of your data is important to us but remember that
                no method of transmission over the Internet or method of
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your Personal Data, we
                cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                5. Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date at the top of
                this Privacy Policy. You are advised to review this Privacy
                Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                6. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <ul className="ml-6 space-y-1">
                <li>- Email: privacy@leddar.com</li>
                <li>- Support email: support@leddar.com</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                7. Your Rights
              </h2>
              <p>
                Depending on your location, you may have certain rights
                regarding your personal data, including:
              </p>
              <ul className="ml-6 space-y-2">
                <li>- The right to access your personal data</li>
                <li>- The right to rectify inaccurate data</li>
                <li>- The right to request deletion of data</li>
                <li>
                  - The right to restrict processing of your personal data
                </li>
                <li>- The right to data portability</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us using the
                contact information provided above.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
