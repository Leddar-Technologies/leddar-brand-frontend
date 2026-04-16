export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    xs: "h-3.5 w-3.5 border-2",
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-10 w-10 border-[3px]",
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-current border-r-transparent ${sizeClass} ${className}`}
    />
  );
}
