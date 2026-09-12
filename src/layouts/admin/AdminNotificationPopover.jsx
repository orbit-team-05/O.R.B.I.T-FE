import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { getAdminDashboardSummary } from "../../features/admin/dashboard/services/adminDashboardApi";

const ALERT_STYLES = {
    DANGER: { dot: "bg-red-500", icon: "bg-red-50 text-red-700" },
    WARNING: { dot: "bg-amber-500", icon: "bg-amber-50 text-amber-700" },
    INFO: { dot: "bg-blue-500", icon: "bg-blue-50 text-blue-700" },
    SUCCESS: { dot: "bg-emerald-500", icon: "bg-emerald-50 text-[#006948]" },
};

function normalizeActionPath(actionPath) {
    return actionPath === "/admin/transactions" ? "/admin/reports" : actionPath;
}

function getAlertCount(alerts) {
    return alerts.reduce((total, alert) => total + Math.max(Number(alert.count) || 0, 0), 0);
}

function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || "Không thể tải thông báo.";
}

export function AdminNotificationPopover() {
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const containerRef = useRef(null);

    const loadAlerts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const summary = await getAdminDashboardSummary();
            setAlerts(summary?.alerts || []);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(loadAlerts, 0);
        return () => window.clearTimeout(timerId);
    }, [loadAlerts]);

    useEffect(() => {
        if (!open) return undefined;

        const handleClickOutside = (event) => {
            if (!containerRef.current?.contains(event.target)) setOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const alertCount = getAlertCount(alerts);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    setOpen((current) => !current);
                    if (!open) loadAlerts();
                }}
                aria-label="Thông báo vận hành"
                aria-expanded={open}
                aria-haspopup="dialog"
                className="relative rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
            >
                <Bell size={20} />
                {alertCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-5 text-white">
                        {alertCount > 99 ? "99+" : alertCount}
                    </span>
                )}
            </button>

            {open && (
                <section
                    role="dialog"
                    aria-label="Danh sách thông báo vận hành"
                    className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                    <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Thông báo vận hành</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Các mục cần Admin theo dõi</p>
                        </div>
                        <button
                            type="button"
                            onClick={loadAlerts}
                            aria-label="Làm mới thông báo"
                            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        >
                            <LoaderCircle size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                    </header>

                    {loading && alerts.length === 0 ? (
                        <div className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500">
                            <LoaderCircle size={16} className="animate-spin" />
                            Đang tải thông báo...
                        </div>
                    ) : error ? (
                        <div className="px-4 py-6 text-sm text-red-600">{error}</div>
                    ) : alerts.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                            Chưa có thông báo cần xử lý.
                        </div>
                    ) : (
                        <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                            {alerts.map((alert) => {
                                const style = ALERT_STYLES[alert.severity] ?? ALERT_STYLES.INFO;
                                const actionPath = normalizeActionPath(alert.actionPath);
                                const content = (
                                    <>
                                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-3">
                                                <span className="text-sm font-medium text-slate-800">{alert.title}</span>
                                                {alert.count > 0 && (
                                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${style.icon}`}>
                                                        {alert.count}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="mt-1 block text-xs leading-5 text-slate-500">{alert.description}</span>
                                        </span>
                                        {actionPath && <ChevronRight size={16} className="mt-1 shrink-0 text-slate-400" />}
                                    </>
                                );

                                return actionPath ? (
                                    <Link
                                        key={alert.code}
                                        to={actionPath}
                                        onClick={() => setOpen(false)}
                                        className="flex gap-3 px-4 py-3 transition hover:bg-slate-50"
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={alert.code} className="flex gap-3 px-4 py-3">
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <footer className="border-t border-slate-200 px-4 py-3">
                        <Link
                            to="/admin/reports"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#006948] hover:underline"
                        >
                            Xem báo cáo giao dịch
                            <ChevronRight size={14} />
                        </Link>
                    </footer>
                </section>
            )}
        </div>
    );
}
