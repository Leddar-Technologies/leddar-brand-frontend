import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import NotificationBell from "../brand/NotificationBell";
import { getSession, logout } from "../../services/authService";

export default function Topbar() {
  const router = useRouter();
  const [brandName, setBrandName] = useState("Business");

  useEffect(() => {
    const session = getSession();
    if (session?.businessName) {
      setBrandName(session.businessName);
    }
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8DED5] bg-white/70 p-4 backdrop-blur-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-[#8A7A72]">
          LEDDAR Brand Portal
        </p>
        <p className="text-sm font-semibold text-ink md:text-base">
          Manage your production with confidence
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <NotificationBell count={3} />
        <Button
          variant="outline"
          className="px-3 py-2 text-xs"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </header>
  );
}
