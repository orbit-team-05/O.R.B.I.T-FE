import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getOwnerDashboardStockAlerts, getOwnerDashboardSummary } from "../../features/owner/dashboard/services/ownerDashboardApi";
import { useAuth } from "../../features/auth/context/AuthContext";

const ALERT_STYLES = { DANGER: "bg-red-50 text-red-700", WARNING: "bg-amber-50 text-amber-700", INFO: "bg-blue-50 text-blue-700" };

function getErrorMessage(error) { return error?.response?.data?.message || error?.message || "Không thể tải thông báo."; }

export function OwnerNotificationPopover() {
    const { user } = useAuth();
    const farmId = user?.farmId;
    const isFarmManager = user?.role === "FARM_MANAGER" || user?.roles?.includes("FARM_MANAGER");
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const containerRef = useRef(null);

    const loadAlerts = useCallback(async () => {
        if (!farmId) return;
        try {
            setLoading(true);
            setError("");
            const [summaryResult, stockResult] = await Promise.allSettled([
                getOwnerDashboardSummary(farmId, { from: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }),
                getOwnerDashboardStockAlerts(farmId, 0, 5),
            ]);
            if (summaryResult.status === "rejected" && stockResult.status === "rejected") throw summaryResult.reason;
            const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
            const stockPage = stockResult.status === "fulfilled" ? stockResult.value : null;
            const nextAlerts = [];
            const pending = Number(summary?.overview?.pendingApprovalCount || 0);
            const lowStock = Number(summary?.overview?.lowStockCount || 0);
            const inactiveDevices = Math.max(Number(summary?.iotOverview?.totalDevices || 0) - Number(summary?.iotOverview?.activeDevices || 0), 0);
            if (pending > 0) nextAlerts.push({ code: "PENDING_APPROVAL", title: "Giao dịch chờ duyệt", description: "Có giao dịch cần kiểm tra trước khi cập nhật tồn kho.", count: pending, severity: "WARNING", path: "/owner/inventory" });
            if (lowStock > 0 || (stockPage?.totalElements || 0) > 0) nextAlerts.push({ code: "LOW_STOCK", title: "Tồn kho cần chú ý", description: "Một hoặc nhiều sản phẩm đang ở mức tồn kho thấp.", count: lowStock || stockPage.totalElements, severity: "DANGER", path: "/owner/inventory" });
            if (inactiveDevices > 0) nextAlerts.push({ code: "DEVICE_STATUS", title: "Thiết bị cân cần kiểm tra", description: "Có thiết bị không ở trạng thái đang hoạt động.", count: inactiveDevices, severity: "INFO", path: "/owner/devices" });
            setAlerts(nextAlerts);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        const timer = window.setTimeout(loadAlerts, 0);
        return () => window.clearTimeout(timer);
    }, [loadAlerts]);

    useEffect(() => {
        if (!open) return undefined;
        const handleClickOutside = (event) => { if (!containerRef.current?.contains(event.target)) setOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const count = alerts.reduce((sum, item) => sum + item.count, 0);
    return <div ref={containerRef} className="relative"><button type="button" onClick={() => { setOpen((current) => !current); if (!open) loadAlerts(); }} aria-label="Mở thông báo vận hành" aria-expanded={open} className="relative rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"><Bell size={20} />{count > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-5 text-white">{count > 99 ? "99+" : count}</span>}</button>
        {open && <section role="dialog" aria-label="Danh sách thông báo vận hành" className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><div><h2 className="text-sm font-semibold text-slate-900">Thông báo vận hành</h2><p className="mt-0.5 text-xs text-slate-500">Các việc cần {isFarmManager ? "Farm Manager" : "Owner"} theo dõi</p></div><button type="button" onClick={loadAlerts} aria-label="Làm mới thông báo" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><LoaderCircle size={16} className={loading ? "animate-spin" : ""} /></button></header>{loading && !alerts.length ? <div className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin" />Đang tải thông báo...</div> : error ? <div className="px-4 py-6 text-sm text-red-600">{error}</div> : !alerts.length ? <div className="px-4 py-8 text-center text-sm text-slate-500">Chưa có việc cần xử lý.</div> : <div className="divide-y divide-slate-100">{alerts.map((alert) => <Link key={alert.code} to={alert.path} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-slate-50"><span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${alert.severity === "DANGER" ? "bg-red-500" : alert.severity === "WARNING" ? "bg-amber-500" : "bg-blue-500"}`} /><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="text-sm font-medium text-slate-800">{alert.title}</span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ALERT_STYLES[alert.severity] || ALERT_STYLES.INFO}`}>{alert.count}</span></span><span className="mt-1 block text-xs leading-5 text-slate-500">{alert.description}</span></span><ChevronRight size={16} className="mt-1 shrink-0 text-slate-400" /></Link>)}</div>}<footer className="border-t border-slate-200 px-4 py-3"><Link to="/owner/reports" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-xs font-medium text-[#006948] hover:underline">Mở báo cáo giao dịch<ChevronRight size={14} /></Link></footer></section>}
    </div>;
}
