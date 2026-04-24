import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "btn-error",
  onConfirm,
  onCancel,
}) {
  // close on ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };

    if (isOpen) window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* dialog */}
      <div className="relative w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-6 animate-scaleIn">
        {/* icon */}
        <div className="flex justify-center mb-4 text-error text-4xl">
          <FaExclamationTriangle />
        </div>

        {/* title */}
        <h2 className="text-xl font-bold text-center mb-2">{title}</h2>

        {/* message */}
        <p className="text-center opacity-70 mb-6">{message}</p>

        {/* actions */}
        <div className="flex justify-center gap-4">
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>

          <button className={`btn ${confirmColor}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
