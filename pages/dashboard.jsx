import PageWrapper from "../components/layout/PageWrapper";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import { recentActivity, stats } from "../data/mockData";

export default function Dashboard() {
  return (
    <PageWrapper>
      <h1 className="page-title">Welcome back, Zara Couture.</h1>
      <p className="page-subtitle">
        Here is your manufacturing activity at a glance.
      </p>

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
