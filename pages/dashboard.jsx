import PageWrapper from "../components/layout/PageWrapper";
import Link from "next/link";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { recentActivity, stats } from "../data/mockData";
import { getSession } from "../services/authService";

export default function Dashboard() {
  const [brandName, setBrandName] = useState("Business");

  useEffect(() => {
    const session = getSession();
    if (session?.businessName) {
      setBrandName(session.businessName);
    }
  }, []);

  return (
    <PageWrapper>
      <section className="overflow-hidden rounded-2xl border border-[#E8DED5] bg-white shadow-card">
        <div className="bg-atmosphere p-5 sm:p-6 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <h1 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">
                Welcome back, {brandName}.
              </h1>
              <p className="mt-2 text-sm text-[#5A4A44] md:text-base">
                Ready for your next run? Use the Request New Quote button to
                start in seconds.
              </p>
            </div>

            <div className="rounded-xl border border-[#E8DED5] bg-white/80 p-4 sm:p-5">
              <Link
                href="/quote-request"
                className="inline-flex w-full sm:w-auto"
              >
                <Button
                  variant="accent"
                  className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 sm:w-auto"
                >
                  <span>Request New Quote</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="card mt-6 overflow-x-auto p-5">
        <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
        <table className="mt-4 min-w-full">
          <thead>
            <tr className="border-b border-[#EEE4DB] text-left text-xs uppercase tracking-wide text-[#7F7068]">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((activity) => (
              <tr
                key={`${activity.date}-${activity.type}`}
                className="border-b border-[#F0E8E0]"
              >
                <td className="px-3 py-3 text-sm">{activity.date}</td>
                <td className="px-3 py-3 text-sm">{activity.type}</td>
                <td className="px-3 py-3 text-sm">{activity.description}</td>
                <td className="px-3 py-3 text-sm">
                  <Badge status={activity.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageWrapper>
  );
}
