import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
                                  open,
                                  title = "Xác nhận thao tác",
                                  description,
                                  confirmText = "Xác nhận",
                                  cancelText = "Hủy",
                                  loading = false,
                                  variant = "danger",
                                  onCancel,
                                  onConfirm,
                              }) {
    if (!open) return null;

    const confirmClass =
        variant === "danger"
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-[#006948] text-white hover:bg-[#00583d]";

    const iconClass =
        variant === "danger"
            ? "bg-red-50 text-red-600"
            : "bg-emerald-50 text-[#006948]";

    return (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Đóng xác nhận"
                onClick={loading ? undefined : onCancel}
                className="absolute inset-0 bg-slate-900/35"
            />

            <div className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    disabled={loading}
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <X size={18} />
                </button>

                <div className="p-6">
                    <div
                        className={[
                            "flex h-11 w-11 items-center justify-center rounded-full",
                            iconClass,
                        ].join(" ")}
                    >
                        <AlertTriangle size={22} />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {description}
                        </p>
                    )}
                </div>

                <footer className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onCancel}
                        className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className={[
                            "h-9 rounded-lg px-4 text-sm font-semibold transition-colors",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            confirmClass,
                        ].join(" ")}
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </button>
                </footer>
            </div>
        </div>
    );
}