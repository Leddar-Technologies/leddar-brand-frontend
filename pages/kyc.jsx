import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function KycPage() {
  return (
    <PageWrapper>
      <div className="rounded-xl border border-[#E6D7CB] bg-[#FFF6E8] p-4">
        <p className="text-sm font-semibold text-[#7A4A16]">
          Complete your KYC to unlock payments.
        </p>
        <div className="mt-2">
          <Badge status="Pending" />
        </div>
      </div>

      <div className="card mt-6 max-w-2xl p-6">
        <h1 className="page-title">KYC Verification</h1>
        <ol className="mt-6 space-y-5">
          <li>
            <p className="text-sm font-semibold text-ink">
              Step 1 - Select ID Type
            </p>
            <select className="input mt-2 max-w-sm">
              <option>NIN</option>
              <option>CAC</option>
              <option>Voter&apos;s Card</option>
            </select>
          </li>
          <li>
            <p className="text-sm font-semibold text-ink">
              Step 2 - Click Verify Identity via VerifyMe
            </p>
            <Button variant="accent" className="mt-2">
              Verify Identity via VerifyMe
            </Button>
          </li>
          <li>
            <p className="text-sm font-semibold text-ink">
              Step 3 - Await confirmation
            </p>
          </li>
        </ol>
        <p className="mt-6 text-xs text-[#6A5B54]">
          Leddar does not store your identity documents. Verification is powered
          by VerifyMe.ng.
        </p>
      </div>
    </PageWrapper>
  );
}
