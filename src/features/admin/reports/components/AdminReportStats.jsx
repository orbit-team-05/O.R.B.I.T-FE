import { ClipboardList, Coins, Package, Clock3 } from "lucide-react";
import { formatCurrency, formatNumber } from "../../../../utils/formatUtils";

function StatCard({ label, value, icon: Icon, iconClassName }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">{label}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}><Icon size={17} /></span>
            </div>
            <strong className="mt-3 block text-2xl font-semibold text-slate-900">{value}</strong>
        </article>
    );
}

export function AdminReportStats({ summary }) {
    const data = summary || {};
    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Tổng giao dịch" value={formatNumber(data.totalTransactions)} icon={ClipboardList} iconClassName="bg-emerald-50 text-[#006948]" />
            <StatCard label="Tổng nhập" value={`${formatNumber(Number(data.totalImportGrams || 0) / 1000)} kg`} icon={Package} iconClassName="bg-blue-50 text-blue-700" />
            <StatCard label="Tổng xuất / thu hoạch" value={`${formatNumber(Number(data.totalExportGrams || 0) / 1000)} kg`} icon={Coins} iconClassName="bg-violet-50 text-violet-700" />
            <StatCard label="Tổng giá trị" value={formatCurrency(data.totalAmount)} icon={Coins} iconClassName="bg-indigo-50 text-indigo-700" />
            <StatCard label="Chờ duyệt / từ chối" value={`${formatNumber(data.pendingCount)} / ${formatNumber(data.rejectedCount)}`} icon={Clock3} iconClassName="bg-amber-50 text-amber-700" />
        </section>
    );
}
