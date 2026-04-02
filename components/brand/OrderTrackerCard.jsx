import { orderSummary, orderTimeline } from "../../data/mockData";

export default function OrderTrackerCard() {
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-ink">Order Summary</h3>
        <div className="mt-4 grid gap-4 text-sm text-[#4E403A] md:grid-cols-2">
          <p>
            <strong>Order ID:</strong> {orderSummary.orderId}
          </p>
          <p>
            <strong>Product Type:</strong> {orderSummary.productType}
          </p>
          <p>
            <strong>Quantity:</strong> {orderSummary.quantity}
          </p>
          <p>
            <strong>Date Placed:</strong> {orderSummary.datePlaced}
          </p>
          <p>
            <strong>Estimated Delivery:</strong>{" "}
            {orderSummary.estimatedDelivery}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-ink">Timeline Updates</h3>
        <div className="mt-4 space-y-4">
          {orderTimeline.map((item) => (
            <div key={item.date} className="border-l-2 border-[#DCCFBE] pl-4">
              <p className="text-xs text-[#8A7A72]">{item.date}</p>
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="text-sm text-[#5A4A44]">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
