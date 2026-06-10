"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", confirmClass, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-lg font-black text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="text-sm font-semibold text-slate-600 bg-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={confirmClass ?? "text-sm font-semibold text-white bg-red-600 px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
