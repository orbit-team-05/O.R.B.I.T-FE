import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    function removeToast(id) {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }

    function showToast({ type = "success", title, message }) {
        const id = crypto.randomUUID();

        setToasts((prev) => [
            ...prev,
            {
                id,
                type,
                title,
                message,
            },
        ]);

        setTimeout(() => {
            removeToast(id);
        }, 3500);
    }

    const value = useMemo(
        () => ({
            success: (message, title = "Thành công") =>
                showToast({ type: "success", title, message }),
            error: (message, title = "Có lỗi xảy ra") =>
                showToast({ type: "error", title, message }),
        }),
        [],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div className="fixed right-5 top-5 z-[9999] flex w-[360px] flex-col gap-3">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === "success";

                    return (
                        <div
                            key={toast.id}
                            className={[
                                "flex gap-3 rounded-xl border bg-white p-4 shadow-lg",
                                isSuccess ? "border-emerald-200" : "border-red-200",
                            ].join(" ")}
                        >
                            <div
                                className={[
                                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                    isSuccess
                                        ? "bg-emerald-50 text-[#006948]"
                                        : "bg-red-50 text-red-600",
                                ].join(" ")}
                            >
                                {isSuccess ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <XCircle size={18} />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    {toast.title}
                                </p>

                                {toast.message && (
                                    <p className="mt-1 text-sm text-slate-600">
                                        {toast.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }

    return context;
}