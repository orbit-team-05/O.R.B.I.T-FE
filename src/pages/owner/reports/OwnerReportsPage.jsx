import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { exportOwnerFarmTransactionReport, getOwnerFarmTransactionReport } from "../../../features/owner/dashboard/services/ownerDashboardApi";
import { formatCurrency, formatDateTime } from "../../../utils/formatUtils";
import { OwnerPageHeader } from "../common/OwnerPageHeader";

function getDefaultDates() {
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 29);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function Stat({ label, value }) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-900">{value}</p></div>;
}

export function OwnerReportsPage() {
    const { user } = useAuth();
    const farmId = user?.farmId;
    const initialFilters = useMemo(() => ({ ...getDefaultDates(), approvalStatus: "", requestedAction: "" }), []);
    const [filters, setFilters] = useState(initialFilters);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const loadReport = useCallback(async (nextFilters) => {
        if (!farmId) return;
        try {
            setLoading(true);
            setError("");
            setReport(await getOwnerFarmTransactionReport(farmId, { ...nextFilters, page: 0, size: 50 }));
        } catch (err) {
            setError(err?.response?.data?.message || "Không thể tải báo cáo giao dịch.");
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadReport(initialFilters), 0);
        return () => window.clearTimeout(timer);
    }, [initialFilters, loadReport]);

    async function handleExport() {
        try {
            setExporting(true);
            const blob = await exportOwnerFarmTransactionReport(farmId, filters);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `orbit-farm-report-${filters.from}-to-${filters.to}.pdf`;
            anchor.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err?.response?.data?.message || "Không thể xuất file PDF.");
        } finally {
            setExporting(false);
        }
    }

    const summary = report?.summary;
    const rows = useMemo(() => report?.items ?? [], [report]);

    if (!farmId) return <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">Tài khoản chưa được gán Farm.</div>;

    return <div className="min-h-screen space-y-6 bg-slate-50">
        <OwnerPageHeader title="Báo cáo" description="Tổng hợp giao dịch của Farm và xuất file PDF phục vụ đối soát." actions={<>
            <button type="button" onClick={() => void loadReport(filters)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700"><RefreshCw size={15} />Làm mới</button>
            <button type="button" onClick={handleExport} disabled={exporting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006948] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Download size={15} />{exporting ? "Đang tạo PDF..." : "Xuất PDF"}</button>
        </>} />
        <main className="space-y-6 px-6 pb-6">
            <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-end"><label className="block flex-1"><span className="text-xs font-medium uppercase text-slate-500">Từ ngày</span><input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" /></label><label className="block flex-1"><span className="text-xs font-medium uppercase text-slate-500">Đến ngày</span><input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" /></label><select value={filters.approvalStatus} onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })} className="h-10 rounded-lg border border-slate-300 px-3 text-sm"><option value="">Tất cả trạng thái</option><option value="APPROVED">Đã duyệt</option><option value="AUTO_APPROVED">Tự duyệt</option><option value="PENDING">Chờ duyệt</option><option value="REJECTED">Từ chối</option></select><select value={filters.requestedAction} onChange={(e) => setFilters({ ...filters, requestedAction: e.target.value })} className="h-10 rounded-lg border border-slate-300 px-3 text-sm"><option value="">Tất cả loại</option><option value="IMPORT">Nhập</option><option value="EXPORT_FEED">Xuất vật tư</option><option value="HARVEST">Thu hoạch</option></select><button type="button" onClick={() => void loadReport(filters)} className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Áp dụng</button></section>
            {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Stat label="Tổng giao dịch" value={summary?.totalTransactions ?? 0} /><Stat label="Tổng nhập" value={`${Number(summary?.totalImportGrams ?? 0) / 1000} kg`} /><Stat label="Tổng xuất" value={`${Number(summary?.totalExportGrams ?? 0) / 1000} kg`} /><Stat label="Tổng tiền" value={formatCurrency(summary?.totalAmount)} /></section>
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4"><FileText size={18} className="text-[#006948]" /><h2 className="font-semibold text-slate-900">Chi tiết giao dịch</h2></div>{loading ? <div className="h-72 animate-pulse bg-slate-50" /> : rows.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-slate-500">Không có dữ liệu trong khoảng thời gian đã chọn.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Sản phẩm</th><th className="px-5 py-3">Loại</th><th className="px-5 py-3">Khối lượng</th><th className="px-5 py-3">Tổng tiền</th><th className="px-5 py-3">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.transactionId}><td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDateTime(row.createdAt)}</td><td className="px-5 py-3 font-medium text-slate-800">{row.productName || "-"}</td><td className="px-5 py-3 text-slate-600">{row.requestedAction || row.transactionType || "-"}</td><td className="px-5 py-3 text-slate-600">{(Number(row.quantityGrams || 0) / 1000).toLocaleString("vi-VN")} kg</td><td className="px-5 py-3 text-slate-600">{formatCurrency(row.totalAmount)}</td><td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{row.approvalStatus || "-"}</span></td></tr>)}</tbody></table></div>}</section>
        </main>
    </div>;
}
