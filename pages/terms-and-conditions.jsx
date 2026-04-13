import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default function TermsAndConditions() {
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
          <h1 className="mb-2 text-4xl font-bold text-ink">
            Terms & Conditions
          </h1>
          <p className="mb-8 text-sm text-[#5A4A44]">
            Last updated: April 2026
          </p>

          <div className="prose max-w-none space-y-6 text-[#3C2F2A]">
            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the LEDDAR platform, you accept and agree
                to be bound by the terms and provision of this agreement. If you
                do not agree to abide by the above, please do not use this
                service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily download one copy of the
                materials (information or software) on LEDDAR for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="ml-6 list-inside space-y-2">
                <li>- Modifying or copying the materials</li>
                <li>
                  - Using the materials for any commercial purpose or for any
                  public display
                </li>
                <li>
                  - Attempting to decompile or reverse engineer any software
                  contained on LEDDAR
                </li>
                <li>
                  - Removing any copyright or other proprietary notations from
                  the materials
                </li>
                <li>
                  - Transferring the materials to another person or "mirroring"
                  the materials on any other server
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                3. Disclaimer
              </h2>
              <p>
                The materials on LEDDAR are provided as is. LEDDAR makes no
                warranties, expressed or implied, and hereby disclaims and
                negates all other warranties including, without limitation,
                implied warranties or conditions of merchantability, fitness for
                a particular purpose, or non-infringement of intellectual
                property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                4. Limitations
              </h2>
              <p>
                In no event shall LEDDAR or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on LEDDAR.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                5. Accuracy of Materials
              </h2>
              <p>
                The materials appearing on LEDDAR could include technical,
                typographical, or photographic errors. LEDDAR does not warrant
                that any of the materials on LEDDAR are accurate, complete, or
                current. LEDDAR may make changes to the materials contained on
                LEDDAR at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">6. Links</h2>
              <p>
                LEDDAR has not reviewed all of the sites linked to its website
                and is not responsible for the contents of any such linked site.
                The inclusion of any link does not imply endorsement by LEDDAR
                of the site. Use of any such linked website is at the user's own
                risk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                7. Modifications
              </h2>
              <p>
                LEDDAR may revise these terms of service for its website at any
                time without notice. By using this website, you are agreeing to
                be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                8. Governing Law
              </h2>
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws of the jurisdiction in which LEDDAR is
                located, and you irrevocably submit to the exclusive
                jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-ink">
                9. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms & Conditions, please
                contact us at support@leddar.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
