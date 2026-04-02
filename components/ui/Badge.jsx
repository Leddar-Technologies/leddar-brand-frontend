export default function Badge({ status }) {
  const normalized = String(status).toLowerCase();

  let style = "bg-[#C49A3C1A] text-gold";
  if (
    normalized.includes("complete") ||
    normalized.includes("paid") ||
    normalized.includes("deliver")
  ) {
    style = "bg-[#2D6A4F1A] text-success";
  }
  if (normalized.includes("reject") || normalized.includes("cancel")) {
    style = "bg-[#B423181A] text-[#B42318]";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
