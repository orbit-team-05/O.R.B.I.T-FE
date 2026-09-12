import { Activity, BarChart3 } from "lucide-react";

function percent(value, total) {
    if (!total || value <= 0) return 0;
    return Math.max(0, Math.min(100, (value / total) * 100));
}

function StatusRow({ item }) {
    const healthyWidth = percent(item.healthy, item.total);
    const pendingWidth = percent(item.pending, item.total);
    const attentionWidth = percent(item.attention, item.total);

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-xs text-slate-500">{item.total} tổng</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                <span className="bg-[#006948]" style={{ width: `${healthyWidth}%` }} />
                <span className="bg-amber-400" style={{ width: `${pendingWidth}%` }} />
                <span className="bg-red-400" style={{ width: `${attentionWidth}%` }} />
            </div>
        </div>
    );
}

export function AdminDashboardStatusChart({ statusBreakdown = [] }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Trạng thái hệ thống</h2>
                    <p className="mt-1 text-xs text-slate-500">Tỷ lệ ổn định, chờ xử lý và cần chú ý</p>
                </div>
                <Activity className="text-slate-400" size={20} />
            </header>

            <div className="mt-6 space-y-5">
                {statusBreakdown.length > 0 ? statusBreakdown.map((item) => (
                    <StatusRow key={item.key} item={item} />
                )) : (
                    <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu trạng thái.</p>
                )}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#006948]" />Ổn định</span>
                <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-400" />Chờ xử lý</span>
                <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-red-400" />Cần chú ý</span>
            </div>
        </section>
    );
}

function formatDay(date) {
    if (!date) return "-";
    const value = new Date(`${date}T00:00:00`);
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(value);
}

function TrendBar({ item, maxTotal }) {
    const totalHeight = percent(item.total, maxTotal);
    const approvedHeight = percent(item.approved, item.total);
    const pendingHeight = percent(item.pending, item.total);
    const rejectedHeight = percent(item.rejected, item.total);

    return (
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end justify-center">
                <div
                    className="flex w-7 flex-col justify-end overflow-hidden rounded-t-lg bg-slate-100"
                    style={{ height: `${totalHeight}%` }}
                    title={`${item.total} giao dịch`}
                >
                    <span className="bg-[#006948]" style={{ height: `${approvedHeight}%` }} />
                    <span className="bg-amber-400" style={{ height: `${pendingHeight}%` }} />
                    <span className="bg-red-400" style={{ height: `${rejectedHeight}%` }} />
                </div>
            </div>
            <span className="text-[11px] text-slate-500">{formatDay(item.date)}</span>
        </div>
    );
}

export function AdminDashboardTransactionChart({ transactionTrend = [] }) {
    const maxTotal = Math.max(...transactionTrend.map((item) => item.total || 0), 1);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Giao dịch 7 ngày gần nhất</h2>
                    <p className="mt-1 text-xs text-slate-500">Theo dõi nhịp vận hành nhập và xuất kho</p>
                </div>
                <BarChart3 className="text-slate-400" size={20} />
            </header>

            <div className="mt-6 flex gap-2">
                {transactionTrend.length > 0 ? transactionTrend.map((item) => (
                    <TrendBar key={item.date} item={item} maxTotal={maxTotal} />
                )) : (
                    <p className="w-full py-8 text-center text-sm text-slate-500">Chưa có dữ liệu giao dịch.</p>
                )}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#006948]" />Đã duyệt</span>
                <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-400" />Chờ duyệt</span>
                <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-red-400" />Từ chối</span>
            </div>
        </section>
    );
}
