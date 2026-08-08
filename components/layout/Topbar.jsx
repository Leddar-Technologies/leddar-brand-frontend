import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { getSession, logout } from "../../services/authService";
import Button from "../ui/Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.myleddar.com/api/v1";

function authHeaders() {
  const session = getSession();
  return { Authorization: `Bearer ${session?.token}` };
}

const TYPE_COLORS = {
  ORDER_UPDATE:   "bg-blue-50 text-blue-600",
  PAYMENT_UPDATE: "bg-emerald-50 text-emerald-600",
  JOB_ASSIGNED:   "bg-amber-50 text-amber-600",
  SAMPLE_READY:   "bg-[#FFF8EA] text-[#8B6A39]",
};

export default function Topbar() {
  const router = useRouter();
  const [brandName, setBrandName]         = useState("Business");
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const dropdownRef                       = useRef(null);

  useEffect(() => {
    const session = getSession();
    if (session?.businessName && session.businessName !== "Business") {
      setBrandName(session.businessName);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/brands/notifications`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.data || []);
    } catch { /* non-fatal */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/brands/notifications/read-all`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* non-fatal */ }
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`${API_URL}/brands/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch { /* non-fatal */ }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8DED5] bg-white/70 p-4 backdrop-blur-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-[#8A7A72]">LEDDAR Brand Portal</p>
        <p className="text-sm font-semibold text-ink md:text-base">
          Manage your production with confidence
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell + Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative rounded-full border border-[#D7CBC1] bg-white p-2.5 text-[#5A4A44] transition hover:border-gold hover:text-gold"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-espresso">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[#E8DED5] bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F4EFEA]">
                <p className="text-sm font-bold text-ink">Notifications</p>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#8B6A39] hover:underline">
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-[#A39289] hover:text-ink">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#A39289]">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-[#F4EFEA] last:border-0 cursor-pointer transition-colors ${
                        n.isRead ? "bg-white hover:bg-atmosphere/30" : "bg-atmosphere/50 hover:bg-atmosphere"
                      }`}
                    >
                      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_COLORS[n.type] || "bg-atmosphere text-[#6A5B54]"}`}>
                        {n.type?.replace(/_/g, " ")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ink leading-relaxed">{n.message}</p>
                        <p className="mt-0.5 text-[10px] text-[#A39289]">
                          {new Date(n.createdAt).toLocaleDateString("en-NG")}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-2 h-2 w-2 rounded-full bg-gold flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button variant="outline" className="px-3 py-2 text-xs" onClick={() => { logout(); router.push("/login"); }}>
          Log Out
        </Button>
      </div>
    </header>
  );
}
