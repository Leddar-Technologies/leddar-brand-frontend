import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import { sidebarLinks } from "../../data/mockData";

export default function Sidebar({ mobile = false, onClose }) {
  const router = useRouter();

  return (
    <aside
      className={`bg-espresso px-4 py-6 ${
        mobile
          ? "h-full w-[82%] max-w-xs"
          : "h-full lg:min-h-screen lg:w-64 xl:w-72"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <Image
          src="/leddar-logo.svg"
          alt="Leddar"
          width={180}
          height={56}
          className="h-8 w-auto"
          priority
        />
        {mobile ? (
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-lg border border-[#FFFFFF22] p-1 text-[#E7CFA7]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <nav className="flex flex-col gap-2">
        {sidebarLinks.map((link) => {
          const active = router.pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={mobile ? onClose : undefined}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[#C49A3C22] text-gold"
                  : "text-[#F4EEE9] hover:bg-[#FFFFFF12] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
