import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Eye, RefreshCw, Search, X } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { getOwnerFarmTransactionReport } from "../../../features/owner/dashboard/services/ownerDashboardApi";
import { formatCurrency, formatDateTime } from "../../../utils/formatUtils";
import { OwnerPageHeader } from "../common/OwnerPageHeader";
import Pagination from "../../../components/common/pagination/Pagination";

function getDefaultDates() {
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 29);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

const ACTION_LABELS = {
    IMPORT: "Nhập kho",
    EXPORT_FEED: "Xuất vật tư",
    HARVEST: "Thu hoạch",
    HARVEST_IN: "Nhập sản phẩm",
    HARVEST_EXPORT: "Bán trực tiếp",
    PRODUCT_SALE: "Bán sản phẩm",
};

const STATUS_LABELS = {
    APPROVED: "Đã duyệt",
    AUTO_APPROVED: "Tự duyệt",
    PENDING: "Chờ duyệt",
    REJECTED: "Từ chối",
};

function actionLabel(value) {
    return ACTION_LABELS[value] || value || "Không xác định";
}

function statusClass(value) {
    if (value === "APPROVED" || value === "AUTO_APPROVED") return "bg-emerald-50 text-emerald-700";
    if (value === "PENDING") return "bg-amber-50 text-amber-700";
    if (value === "REJECTED") return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-600";
}

function formatKg(value) {
    return `${(Number(value || 0) / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} kg`;
}

function TransactionDetailDrawer({ row, onClose }) {
    if (!row) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" role="presentation" onMouseDown={onClose}>
            <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Chi tiết giao dịch" onMouseDown={(event) => event.stopPropagation()}>
                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Giao dịch #{row.transactionId}</p>
                        <h2 className="mt-1 text-xl font-semibold text-slate-900">{actionLabel(row.requestedAction || row.transactionType)}</h2>
                        <p className="mt-1 text-sm text-slate-500">{formatDateTime(row.createdAt)}</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5 p-6">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-sm text-slate-500">Trạng thái xử lý</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(row.approvalStatus)}`}>{STATUS_LABELS[row.approvalStatus] || row.approvalStatus || "-"}</span>
                    </div>
                    <section className="grid gap-4 sm:grid-cols-2">
                        <Detail label="Sản phẩm" value={row.productName || "-"} />
                        <Detail label="Loại giao dịch" value={actionLabel(row.requestedAction || row.transactionType)} />
                        <Detail label="Khối lượng" value={formatKg(row.quantityGrams)} />
                        <Detail label="Đơn giá" value={formatCurrency(row.unitPrice)} />
                        <Detail label="Tổng tiền" value={formatCurrency(row.totalAmount)} />
                        <Detail label="Người tạo" value={row.createdByName || "-"} />
                        <Detail label="Thiết bị cân" value={row.scaleDeviceId || "Không sử dụng"} />
                        <Detail label="MAC thiết bị" value={row.macAddress || "-"} />
                    </section>
                    <section className="rounded-xl border border-slate-200 p-4">
                        <h3 className="text-sm font-semibold text-slate-900">Ảnh hưởng nghiệp vụ</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Tồn kho thực tế chỉ thay đổi khi giao dịch được duyệt. Giao dịch đang chờ duyệt chỉ được tính vào tồn kho dự kiến.
                        </p>
                    </section>
                </div>
            </aside>
        </div>
    );
}

function Detail({ label, value }) {
    return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-800">{value}</p></div>;
}

export function OwnerTransactionsPage() {
    const { user } = useAuth();
    const farmId = user?.farmId;
    const [filters, setFilters] = useState(() => ({ ...getDefaultDates(), approvalStatus: "", requestedAction: "", keyword: "" }));
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);

    const loadTransactions = useCallback(async (nextFilters, page = 0) => {
        if (!farmId) return;
        try {
            setLoading(true);
            setError("");
            setReport(await getOwnerFarmTransactionReport(farmId, { ...nextFilters, page, size: 20 }));
        } catch (err) {
            setError(err?.response?.data?.message || "Không thể tải lịch sử giao dịch.");
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadTransactions({ ...getDefaultDates(), approvalStatus: "", requestedAction: "", keyword: "" }, 0);
        }, 0);
        return () => window.clearTimeout(timer);
    }, [farmId, loadTransactions]);

    const rows = useMemo(() => report?.items ?? [], [report]);
    const currentPage = Number(report?.page ?? 0);
    const totalPages = Number(report?.totalPages ?? 0);

    function updateFilter(name, value) {
        setFilters((previous) => ({ ...previous, [name]: value }));
    }

    function applyFilters() {
        void loadTransactions(filters, 0);
    }

    if (!farmId) return <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">Tài khoản chưa được gán Farm.</div>;

    return (
        <div className="min-h-full space-y-6">
            <OwnerPageHeader
                title="Giao dịch"
                description="Theo dõi toàn bộ lịch sử nhập, xuất, thu hoạch và bán sản phẩm của Farm."
                actions={<button type="button" onClick={() => void loadTransactions(filters, currentPage)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Làm mới</button>}
            />

            <main className="space-y-6 px-6 pb-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Tổng giao dịch" value={report?.summary?.totalTransactions ?? 0} />
                    <SummaryCard label="Tổng nhập" value={formatKg(report?.summary?.totalImportGrams)} />
                    <SummaryCard label="Tổng xuất" value={formatKg(report?.summary?.totalExportGrams)} />
                    <SummaryCard label="Đang chờ duyệt" value={report?.summary?.pendingCount ?? 0} />
                </section>

                <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
                    <label className="block flex-1"><span className="text-xs font-medium uppercase text-slate-500">Từ ngày</span><span className="relative mt-1 block"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="date" value={filters.from} onChange={(event) => updateFilter("from", event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm" /></span></label>
                    <label className="block flex-1"><span className="text-xs font-medium uppercase text-slate-500">Đến ngày</span><span className="relative mt-1 block"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="date" value={filters.to} onChange={(event) => updateFilter("to", event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm" /></span></label>
                    <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400" /><input value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="Tìm sản phẩm, người tạo, thiết bị..." className="mt-1 h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm" /></div>
                    <select value={filters.requestedAction} onChange={(event) => updateFilter("requestedAction", event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="">Tất cả loại</option>{Object.entries(ACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    <select value={filters.approvalStatus} onChange={(event) => updateFilter("approvalStatus", event.target.value)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="">Tất cả trạng thái</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    <button type="button" onClick={applyFilters} className="h-10 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]">Áp dụng</button>
                </section>

                {error ? <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Lịch sử giao dịch</h2><p className="mt-1 text-xs text-slate-500">Chọn một dòng để xem chi tiết nghiệp vụ.</p></div><span className="text-xs text-slate-500">{report?.totalElements ?? 0} bản ghi</span></div>
                    {loading ? <div className="h-80 animate-pulse bg-slate-50" /> : rows.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-slate-500">Không có giao dịch trong khoảng thời gian đã chọn.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Loại</th><th className="px-5 py-3">Sản phẩm</th><th className="px-5 py-3">Khối lượng</th><th className="px-5 py-3">Người tạo</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right"> </th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.transactionId} className="cursor-pointer transition hover:bg-emerald-50/40" onClick={() => setSelectedRow(row)}><td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDateTime(row.createdAt)}</td><td className="px-5 py-4 font-medium text-slate-800">{actionLabel(row.requestedAction || row.transactionType)}</td><td className="px-5 py-4 text-slate-600">{row.productName || "-"}</td><td className="px-5 py-4 text-slate-600">{formatKg(row.quantityGrams)}</td><td className="px-5 py-4 text-slate-600">{row.createdByName || "-"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.approvalStatus)}`}>{STATUS_LABELS[row.approvalStatus] || row.approvalStatus || "-"}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={(event) => { event.stopPropagation(); setSelectedRow(row); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#006948] hover:bg-emerald-50"><Eye size={15} />Xem</button></td></tr>)}</tbody></table></div>}
                    <Pagination page={currentPage} totalPages={totalPages} totalElements={report?.totalElements ?? rows.length} loading={loading} onPageChange={(nextPage) => void loadTransactions(filters, nextPage)} />
                </section>
            </main>
            <TransactionDetailDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
        </div>
    );
}

function SummaryCard({ label, value }) {
    return <div className="rounded-xl border border-slate-200 bg-white px-5 py-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p></div>;
}

export default OwnerTransactionsPage;
