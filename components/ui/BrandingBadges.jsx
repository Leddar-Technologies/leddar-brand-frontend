const BRANDING_NONE = "I don't need any of these";

export default function BrandingBadges({ items, className = "" }) {
  if (!items || items.length === 0) return null;
  const real = items.filter((i) => i !== BRANDING_NONE);
  if (real.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {real.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full border border-[#E8D89A] bg-[#FFF8EA] px-2 py-0.5 text-[10px] font-semibold text-[#9A7B2E]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
