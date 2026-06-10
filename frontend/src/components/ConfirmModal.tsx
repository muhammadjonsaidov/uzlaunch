"use client";
import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  confirmClass?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = "Confirm", confirmClass, loading, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-lg font-black text-slate-900 mb-2">{title}</h2>
        <div className="text-sm text-slate-500 mb-6">{message}</div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={loading}
            className="text-sm font-semibold text-slate-600 bg-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`${confirmClass ?? "text-sm font-semibold text-white bg-red-600 px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"} disabled:opacity-60`}>
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
