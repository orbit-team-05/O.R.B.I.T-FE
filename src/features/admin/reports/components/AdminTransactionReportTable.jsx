import { formatCurrency, formatDateTime, formatNumber } from "../../../../utils/formatUtils";

const ACTION_LABELS = {
    IMPORT: "Nhập kho",
    EXPORT_FEED: "Xuất thức ăn",
    HARVEST: "Thu hoạch",
};

const STATUS_LABELS = {
    PENDING: ["Chờ duyệt", "bg-amber-50 text-amber-700"],
    APPROVED: ["Đã duyệt", "bg-emerald-50 text-[#006948]"],
    AUTO_APPROVED: ["Tự động duyệt", "bg-blue-50 text-blue-700"],
    REJECTED: ["Từ chối", "bg-red-50 text-red-700"],
};

function StatusBadge({ value }) {
    const [label, className] = STATUS_LABELS[value] || [value || "—", "bg-slate-100 text-slate-600"];
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${className}`}>{label}</span>;
}

export function AdminTransactionReportTable({ report, loading, onPageChange }) {
    const items = report?.items || [];
    const page = report?.page ?? 0;
    const totalPages = report?.totalPages ?? 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">Preview báo cáo giao dịch</h2>
                    <p className="mt-1 text-xs text-slate-500">{report?.totalElements ?? 0} dòng theo bộ lọc hiện tại</p>
                </div>
                <span className="text-xs text-slate-500">Đơn vị khối lượng: kg</span>
            </header>

            {loading ? <div className="h-72 animate-pulse bg-slate-50" /> : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Mã</th>
                                    <th className="px-5 py-3">Thời gian</th>
                                    <th className="px-5 py-3">Farm</th>
                                    <th className="px-5 py-3">Hành động</th>
                                    <th className="px-5 py-3">Sản phẩm</th>
                                    <th className="px-5 py-3 text-right">Khối lượng</th>
                                    <th className="px-5 py-3 text-right">Tổng tiền</th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                    <th className="px-5 py-3">Người tạo / cân</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.transactionId} className="border-t border-slate-100 text-slate-700">
                                        <td className="px-5 py-4 font-medium text-slate-900">#{item.transactionId}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDateTime(item.createdAt)}</td>
                                        <td className="px-5 py-4 font-medium text-slate-800">{item.farmName || "—"}</td>
                                        <td className="px-5 py-4">{ACTION_LABELS[item.requestedAction] || item.requestedAction || "—"}</td>
                                        <td className="max-w-[180px] truncate px-5 py-4">{item.productName || "—"}</td>
                                        <td className="px-5 py-4 text-right font-medium">{formatNumber(Number(item.quantityGrams || 0) / 1000)} kg</td>
                                        <td className="px-5 py-4 text-right">{formatCurrency(item.totalAmount)}</td>
                                        <td className="px-5 py-4"><StatusBadge value={item.approvalStatus} /></td>
                                        <td className="px-5 py-4">
                                            <div className="max-w-[180px] truncate font-medium text-slate-800">{item.createdByName || "—"}</div>
                                            {item.scaleDeviceId && <div className="mt-1 text-[11px] text-slate-500">{item.scaleDeviceId}</div>}
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-500">Không có giao dịch phù hợp.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3">
                        <button type="button" disabled={page <= 0} onClick={() => onPageChange(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
                        <span className="text-xs text-slate-600">Trang {page + 1} / {Math.max(totalPages, 1)}</span>
                        <button type="button" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
                    </footer>
                </>
            )}
        </section>
    );
}
