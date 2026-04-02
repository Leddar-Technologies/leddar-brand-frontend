export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const variants = {
    primary: "bg-leather text-white hover:bg-[#5A2F22]",
    accent: "bg-gold text-espresso hover:bg-[#B78D31]",
    outline:
      "border border-[#D7CBC1] bg-transparent text-ink hover:bg-[#F3ECE6]",
    dangerOutline:
      "border border-[#B42318] text-[#B42318] hover:bg-[#B4231812]",
  };

  return (
    <button
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
