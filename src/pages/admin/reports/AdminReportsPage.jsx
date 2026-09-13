import { AdminPageSkeleton } from "../../../components/common/loading/AdminPageSkeleton";
import { Download, FileBarChart, FileText, RefreshCw } from "lucide-react";

import { AdminReportFilters } from "../../../features/admin/reports/components/AdminReportFilters";
import { AdminReportStats } from "../../../features/admin/reports/components/AdminReportStats";
import { AdminSystemReportPanel } from "../../../features/admin/reports/components/AdminSystemReportPanel";
import { AdminTransactionReportTable } from "../../../features/admin/reports/components/AdminTransactionReportTable";
import { useAdminReports } from "../../../features/admin/reports/hooks/useAdminReports";

function toInputDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function ReportTypeTabs({ reportType, onChange }) {
    return (
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button type="button" onClick={() => onChange("transactions")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${reportType === "transactions" ? "bg-white text-[#006948] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}><FileText size={16} />Giao dịch kho</button>
            <button type="button" onClick={() => onChange("system")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${reportType === "system" ? "bg-white text-[#006948] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}><FileBarChart size={16} />Snapshot hệ thống</button>
        </div>
    );
}

export function AdminReportsPage() {
    const {
        reportType,
        switchReportType,
        filters,
        setFilters,
        applyFilters,
        transactionReport,
        systemReport,
        farms,
        loading,
        exporting,
        error,
        changePage,
        changeSort,
        sortKey,
        reload,
        exportReport,
    } = useAdminReports();

    if (loading && !transactionReport && !systemReport) {
        return <AdminPageSkeleton variant="reports" />;
    }

    function resetFilters() {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 29);
        const nextFilters = {
            from: toInputDate(from),
            to: toInputDate(today),
            farmId: "",
            requestedAction: "",
            approvalStatus: "",
            deviceId: "",
            keyword: "",
            page: 0,
            size: 50,
        };
        setFilters(nextFilters);
        applyFilters(nextFilters);
    }

    return (
        <section className="space-y-5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Báo cáo</h1>
                    <p className="mt-1 text-sm text-slate-600">Xem, lọc và xuất dữ liệu vận hành toàn hệ thống.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={reload} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Làm mới</button>
                    <button type="button" onClick={exportReport} disabled={loading || exporting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:cursor-not-allowed disabled:opacity-60"><Download size={16} />{exporting ? "Đang tạo PDF..." : "Xuất PDF"}</button>
                </div>
            </header>

            <ReportTypeTabs reportType={reportType} onChange={switchReportType} />

            {reportType === "transactions" && (
                <>
                    <AdminReportFilters filters={filters} farms={farms} loading={loading} onChange={setFilters} onSubmit={() => applyFilters()} onReset={resetFilters} />
                    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                    <AdminReportStats summary={transactionReport?.summary} />
                    <AdminTransactionReportTable report={transactionReport} loading={loading} onPageChange={changePage} onSortChange={changeSort} sortKey={sortKey} />
                </>
            )}

            {reportType === "system" && (
                <>
                    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                    <AdminSystemReportPanel report={systemReport} loading={loading} exporting={exporting} onExport={exportReport} />
                </>
            )}
        </section>
    );
}
