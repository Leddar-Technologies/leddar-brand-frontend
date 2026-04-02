import PageWrapper from "../components/layout/PageWrapper";
import OrderTrackerCard from "../components/brand/OrderTrackerCard";

const steps = ["Quote Approved", "In Production", "Shipped", "Delivered"];

export default function OrderTrackerPage() {
  return (
    <PageWrapper>
      <h1 className="page-title">Order Tracker</h1>
      <div className="card mt-6 p-5">
        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          {steps.map((step, index) => {
            const active = step === "In Production";
            return (
              <div key={step} className="flex items-center gap-3">
                <span
                  className={`relative h-3 w-3 rounded-full ${active ? "bg-gold" : "bg-[#DCCFBE]"}`}
                >
                  {active ? (
                    <span className="absolute -inset-1 animate-ping rounded-full bg-[#C49A3C99]" />
                  ) : null}
                </span>
                <span
                  className={`text-sm font-medium ${active ? "text-gold" : "text-[#6A5B54]"}`}
                >
                  {step}
                </span>
                {index < steps.length - 1 ? (
                  <span className="hidden h-[2px] w-10 bg-[#DCCFBE] md:block" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6">
        <OrderTrackerCard />
      </div>
    </PageWrapper>
  );
}
