import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileImage, RefreshCw, XCircle } from "lucide-react";
import { ImagePreviewModal } from "../../../components/ui/ImagePreviewModal";
import { useStaffTransactionHistory } from "../../../features/staff/transactions/hooks/useStaffTransactionHistory";
import { OwnerPageHeader } from "../../owner/common/OwnerPageHeader";
import Pagination from "../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../components/common/sort/SortSelect";
import { formatNumber } from "../../../utils/formatUtils";
import { sortItems } from "../../../utils/listSort";

const FILTERS = [
    { value: "", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
];

const TYPE_LABELS = { IMPORT: "Nhập kho", EXPORT_FEED: "Xuất vật tư", HARVEST_EXPORT: "Bán thu hoạch", HARVEST_IN: "Lưu kho thu hoạch" };
const STATUS_META = {
    PENDING: ["Chờ duyệt", "bg-amber-50 text-amber-700", Clock3],
    APPROVED: ["Đã duyệt", "bg-emerald-50 text-emerald-700", CheckCircle2],
    AUTO_APPROVED: ["Đã duyệt", "bg-emerald-50 text-emerald-700", CheckCircle2],
    REJECTED: ["Từ chối", "bg-red-50 text-red-700", XCircle],
};

function formatDate(value) {
    if (!value) return "Chưa xác định";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Chưa xác định" : date.toLocaleString("vi-VN");
}

function TransactionCard({ transaction, onPreview }) {
    const [statusLabel, statusClass, StatusIcon] = STATUS_META[transaction.approvalStatus] || ["Không xác định", "bg-slate-100 text-slate-600", Clock3];
    const certificateImages = transaction.certificateImageUrls || [];
    return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-semibold text-slate-900">{TYPE_LABELS[transaction.transactionType] || transaction.transactionType || "Giao dịch"}</p><p className="mt-1 text-xs text-slate-500">{formatDate(transaction.createdAt)} · #{transaction.transactionId}</p></div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}><StatusIcon size={14} />{statusLabel}</span>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-slate-500">Sản phẩm</p><p className="mt-1 font-medium text-slate-800">{transaction.productName || "Chưa có"}</p></div>
            <div><p className="text-xs text-slate-500">Mùa vụ</p><p className="mt-1 font-medium text-slate-800">{transaction.seasonName || "Không gắn mùa vụ"}</p></div>
            <div><p className="text-xs text-slate-500">Khối lượng</p><p className="mt-1 font-medium text-slate-800">{formatNumber(Number(transaction.quantityGrams || 0) / 1000)} kg</p></div>
            <div><p className="text-xs text-slate-500">Thiết bị cân</p><p className="mt-1 font-medium text-slate-800">{transaction.deviceName || "Nhập tay"}</p></div>
        </div>
        {transaction.approvalStatus === "REJECTED" && transaction.approvalNote ? <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"><b>Lý do từ chối:</b> {transaction.approvalNote}</div> : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">{transaction.evidenceImageUrl ? "Đã có bằng chứng" : "Không có bằng chứng"}{certificateImages.length ? ` · ${certificateImages.length} ảnh chứng chỉ` : ""}</p>
            <div className="flex flex-wrap gap-2">
                {transaction.evidenceImageUrl ? <button type="button" onClick={() => onPreview(transaction.evidenceImageUrl)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><FileImage size={15} />Xem bằng chứng</button> : null}
                {certificateImages.map((imageUrl, index) => <button key={`${imageUrl}-${index}`} type="button" onClick={() => onPreview(imageUrl)} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><FileImage size={15} />Chứng chỉ {index + 1}</button>)}
            </div>
        </div>
    </article>;
}

function HistorySkeleton() {
    return <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>;
}

export function StaffTransactionHistoryPage() {
    const [status, setStatus] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const { transactions, pageInfo, page, setPage, loading, error, reload } = useStaffTransactionHistory(status);
    const [sortKey, setSortKey] = useState("createdDesc");
    const sortedTransactions = useMemo(() => sortItems(transactions, sortKey, {
        createdDesc: { value: (item) => new Date(item.createdAt || 0).getTime(), direction: "desc" },
        createdAsc: { value: (item) => new Date(item.createdAt || 0).getTime(), direction: "asc" },
        quantityDesc: { value: (item) => Number(item.quantityGrams || 0), direction: "desc" },
        status: { value: (item) => item.approvalStatus, direction: "asc" },
        product: { value: (item) => item.productName, direction: "asc" },
    }), [sortKey, transactions]);

    return <>
        <section className="space-y-6 animate-fade-in"><OwnerPageHeader title="Lịch sử giao dịch" description="Theo dõi các giao dịch do chính tài khoản Staff tạo và trạng thái phê duyệt." actions={<button type="button" onClick={reload} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Làm mới</button>} />
            <div className="flex flex-wrap gap-2">{FILTERS.map((filter) => <button type="button" key={filter.value || "all"} onClick={() => { setStatus(filter.value); setPage(0); }} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${status === filter.value ? "bg-[#006948] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{filter.label}</button>)}</div>
            {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="flex flex-wrap justify-end"><SortSelect value={sortKey} onChange={setSortKey} options={[{ value: "createdDesc", label: "Mới nhất trước" }, { value: "createdAsc", label: "Cũ nhất trước" }, { value: "quantityDesc", label: "Khối lượng giảm dần" }, { value: "status", label: "Theo trạng thái" }, { value: "product", label: "Sản phẩm A → Z" }]} /></div>
            {loading && !pageInfo.content ? <HistorySkeleton /> : sortedTransactions.length ? <div className="space-y-3">{sortedTransactions.map((transaction) => <TransactionCard key={transaction.transactionId} transaction={transaction} onPreview={setPreviewImage} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">Chưa có giao dịch nào ở bộ lọc này.</div>}
            <Pagination page={page} totalPages={pageInfo.totalPages} totalElements={pageInfo.totalElements} pageSize={pageInfo.size} itemCount={transactions.length} loading={loading} onPageChange={setPage} />
        </section><ImagePreviewModal open={Boolean(previewImage)} src={previewImage} onClose={() => setPreviewImage(null)} />
    </>;
}
