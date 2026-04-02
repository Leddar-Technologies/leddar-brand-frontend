import { useMemo, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { orderHistory } from "../data/mockData";

const tabs = ["All Orders", "Sample Orders", "Production Orders"];

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("All Orders");

  const rows = useMemo(() => {
    if (activeTab === "Sample Orders") {
      return orderHistory.filter((item) => item.type === "Sample");
    }
    if (activeTab === "Production Orders") {
      return orderHistory.filter((item) => item.type === "Production");
    }
    return orderHistory;
  }, [activeTab]);

  return (
    <PageWrapper>
      <h1 className="page-title">Order History</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-gold text-espresso"
                : "border border-[#D8CCC2] bg-white text-[#5A4A44]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card mt-5 overflow-x-auto p-4">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#EEE4DB] text-left text-xs uppercase tracking-wide text-[#7F7068]">
              <th className="px-3 py-3">Order ID</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[#EEE4DB]">
                <td className="px-3 py-3 text-sm">{row.id}</td>
                <td className="px-3 py-3 text-sm">{row.type}</td>
                <td className="px-3 py-3 text-sm">{row.product}</td>
                <td className="px-3 py-3 text-sm">{row.date}</td>
                <td className="px-3 py-3 text-sm">
                  <Badge status={row.status} />
                </td>
                <td className="px-3 py-3 text-sm">
                  <Button variant="outline" className="px-3 py-2 text-xs">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
