import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { quoteBreakdown } from "../data/mockData";

export default function QuoteResponsePage() {
  return (
    <PageWrapper>
      <div className="card max-w-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="page-title">Quote Response</h1>
          <Badge status="Pending" />
        </div>

        <div className="space-y-3 rounded-xl border border-[#E9DFD6] bg-white p-4">
          {quoteBreakdown.map((row) => (
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
              <span>₦70,000</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="accent">Approve &amp; Proceed to Payment</Button>
          <Button variant="dangerOutline">Reject Quote</Button>
        </div>
      </div>
    </PageWrapper>
  );
}
