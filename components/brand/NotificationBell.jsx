import { Bell } from "lucide-react";

export default function NotificationBell({ count = 0 }) {
  return (
    <button className="relative rounded-full border border-[#D7CBC1] bg-white p-2.5 text-[#5A4A44] transition hover:border-gold hover:text-gold">
      <Bell className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-espresso">
          {count}
        </span>
      ) : null}
    </button>
  );
}
