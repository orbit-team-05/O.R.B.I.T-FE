import { Download, FileBarChart } from "lucide-react";
import { formatDateTime, formatNumber } from "../../../../utils/formatUtils";

function Metric({ label, value }) {
    return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><strong className="mt-2 block text-2xl font-semibold text-slate-900">{formatNumber(value)}</strong></div>;
}

export function AdminSystemReportPanel({ report, loading, exporting, onExport }) {
    if (loading) return <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />;
    if (!report) return null;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#006948]"><FileBarChart size={19} /></span>
                    <div><h2 className="text-base font-semibold text-slate-900">Snapshot hệ thống</h2><p className="mt-1 text-xs text-slate-500">Cập nhật: {formatDateTime(report.generatedAt)}</p></div>
                </div>
                <button type="button" onClick={onExport} disabled={exporting} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d] disabled:opacity-60"><Download size={16} />Xuất PDF</button>
            </header>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><h3 className="mb-3 text-sm font-semibold text-slate-800">Người dùng</h3><div className="grid grid-cols-3 gap-2"><Metric label="Tổng" value={report.overview.totalUsers} /><Metric label="Active" value={report.overview.activeUsers} /><Metric label="Inactive" value={report.overview.inactiveUsers} /></div></div>
                <div><h3 className="mb-3 text-sm font-semibold text-slate-800">Nông trại</h3><div className="grid grid-cols-3 gap-2"><Metric label="Tổng" value={report.overview.totalFarms} /><Metric label="Active" value={report.overview.activeFarms} /><Metric label="Inactive" value={report.overview.inactiveFarms} /></div></div>
                <div><h3 className="mb-3 text-sm font-semibold text-slate-800">Thiết bị cân</h3><div className="grid grid-cols-2 gap-2"><Metric label="Tổng" value={report.iotOverview.totalDevices} /><Metric label="Active" value={report.iotOverview.activeDevices} /><Metric label="Chưa tạo" value={report.iotOverview.uncreatedDevices} /><Metric label="Chưa gắn Farm" value={report.iotOverview.unassignedDevices} /></div></div>
            </div>
        </section>
    );
}
