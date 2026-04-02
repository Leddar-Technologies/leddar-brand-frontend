export default function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-[#6A5B54]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
