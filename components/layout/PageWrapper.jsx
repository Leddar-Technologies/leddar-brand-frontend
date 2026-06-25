import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Menu } from "lucide-react";
import { getSession } from "../../services/authService";
import Spinner from "../ui/Spinner";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PageWrapper({ children }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <div className="bg-atmosphere flex min-h-screen items-center justify-center p-6">
        <div className="card w-full max-w-sm p-6 text-center text-sm text-[#5A4A44]">
          <div className="flex items-center justify-center gap-3">
            <Spinner className="text-gold" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atmosphere lg:flex">
      <div className="hidden lg:block lg:w-64 xl:w-72 lg:shrink-0">
        <div className="fixed top-0 left-0 h-screen w-64 xl:w-72 overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-[#1C141280] lg:hidden">
          <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
        </div>
      ) : null}

      <main className="flex-1 min-w-0 p-4 md:p-5 lg:p-6 xl:p-8">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E8DED5] bg-white/75 p-3 lg:hidden">
          <p className="text-sm font-bold tracking-[0.18em] text-leather">
            LEDDAR
          </p>
          <button
            className="rounded-lg border border-[#D7CBC1] bg-white p-2 text-[#5A4A44]"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        <Topbar />
        <div className="mt-5 md:mt-6">{children}</div>
      </main>
    </div>
  );
}
