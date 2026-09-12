import { CheckCircle, Search, Inbox, PackageOpen } from "lucide-react";
import { formatDateTime } from "../../../../utils/formatUtils";

export function PendingTransactionList({ transactions, loading, onApprove, onViewDetail }) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-slate-200" />
                                <div className="h-3 w-1/2 rounded bg-slate-200" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!transactions?.length) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-slate-900">Không có yêu cầu chờ duyệt</h3>
                <p className="mt-1 text-sm text-slate-500">Tất cả các giao dịch đã được xử lý</p>
            </div>
        );
    }

    const getTypeConfig = (type) => {
        switch (type) {
            case "IMPORT":
                return { label: "Nhập kho", color: "text-blue-700 bg-blue-50 border-blue-200", icon: Inbox };
            case "EXPORT_FEED":
            case "HARVEST_EXPORT":
                return { label: "Xuất kho", color: "text-orange-700 bg-orange-50 border-orange-200", icon: PackageOpen };
            case "HARVEST_IN":
                return { label: "Lưu kho thu hoạch", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: Inbox };
            case "PRODUCT_SALE":
                return { label: "Bán từ kho sản phẩm", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: PackageOpen };
            default:
                return { label: type, color: "text-slate-700 bg-slate-50 border-slate-200", icon: PackageOpen };
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {transactions.map((tx) => {
                const config = getTypeConfig(tx.transactionType);
                const Icon = config.icon;
                
                return (
                    <div key={tx.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-[#006948] hover:shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.color}`}>
                                <Icon className="h-3.5 w-3.5" />
                                {config.label}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                {formatDateTime(tx.createdAt)}
                            </span>
                        </div>
                        
                        <div className="flex flex-col gap-3 p-5">
                            <div>
                                <h4 className="font-semibold text-slate-900 line-clamp-1" title={tx.productName}>
                                    {tx.productName}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">{tx.productCategory}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Số lượng</p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {Number(tx.quantityKg || 0).toLocaleString("vi-VN")} {tx.storageUnit === "PIECE" ? "cái" : tx.storageUnit === "MILLILITER" ? "ml" : "kg"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Người tạo</p>
                                    <p className="mt-1 truncate text-sm font-medium text-slate-900" title={tx.requestedBy}>{tx.requestedBy}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex gap-2 border-t border-slate-100 p-3">
                            <button
                                onClick={() => onViewDetail(tx)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                            >
                                <Search size={16} />
                                Chi tiết
                            </button>
                            <button
                                onClick={() => onApprove(tx.id)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#006948] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00583d]"
                            >
                                <CheckCircle size={16} />
                                Duyệt
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
