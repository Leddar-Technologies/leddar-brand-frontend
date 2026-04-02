import { X } from "lucide-react";

export default function Modal({ open, title, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1C141266] p-3 sm:items-center sm:p-4">
      <div className="card w-full max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-1.5rem)] overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-ink sm:text-lg">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-full border border-[#E2D6CC] p-1"
          >
            <X className="h-4 w-4 text-[#6A5B54] sm:h-5 sm:w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
