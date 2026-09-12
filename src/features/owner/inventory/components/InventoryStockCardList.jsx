import { useMemo, useState } from "react";
import { Package, AlertTriangle, CheckCircle, Image as ImageIcon } from "lucide-react";
import Pagination from "../../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../../components/common/sort/SortSelect";
import { sortItems } from "../../../../utils/listSort";

const CATEGORY_LABELS = {
    FEED: 'Thức ăn',
    MEDICINE: 'Thuốc thú y',
    CHEMICAL: 'Hóa chất',
    MATERIAL: 'Vật tư khác',
    HARVEST_PRODUCT: 'Sản phẩm nuôi',
};

const CATEGORY_COLORS = {
    FEED: "bg-amber-50 text-amber-600 border-amber-200",
    MEDICINE: "bg-blue-50 text-blue-600 border-blue-200",
    CHEMICAL: "bg-purple-50 text-purple-600 border-purple-200",
    MATERIAL: "bg-slate-50 text-slate-600 border-slate-200",
    HARVEST_PRODUCT: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatQuantity(value, storageUnit) {
    const numberValue = Number(value || 0);

    if (storageUnit === "MILLILITER") {
        if (numberValue >= 1000) {
            return `${(numberValue / 1000).toLocaleString("vi-VN")} lít`;
        }
        return `${numberValue.toLocaleString("vi-VN")} ml`;
    }

    if (numberValue >= 1000) {
        return `${(numberValue / 1000).toLocaleString("vi-VN")} kg`;
    }

    return `${numberValue.toLocaleString("vi-VN")} g`;
}

export function InventoryStockCardList({
    stocks = [],
    pageInfo,
    loading = false,
    onPageChange,
    onViewDetail,
}) {
    const [sortKey, setSortKey] = useState("updatedDesc");
    const sortedStocks = useMemo(() => sortItems(stocks, sortKey, {
        nameAsc: { value: (item) => item.productName, direction: "asc" },
        nameDesc: { value: (item) => item.productName, direction: "desc" },
        quantityDesc: { value: (item) => Number(item.actualQuantityGrams || item.quantityGrams || 0), direction: "desc" },
        quantityAsc: { value: (item) => Number(item.actualQuantityGrams || item.quantityGrams || 0), direction: "asc" },
        updatedDesc: { value: (item) => new Date(item.updatedAt || 0).getTime(), direction: "desc" },
    }), [stocks, sortKey]);

    if (loading && stocks.length === 0) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-[320px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                    />
                ))}
            </div>
        );
    }

    if (stocks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <Package size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Kho trống</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Chưa có sản phẩm nào được nhập vào kho. Vui lòng thực hiện nhập kho để bắt đầu theo dõi.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <SortSelect value={sortKey} onChange={setSortKey} options={[
                    { value: "updatedDesc", label: "Cập nhật gần đây" },
                    { value: "nameAsc", label: "Tên A → Z" },
                    { value: "nameDesc", label: "Tên Z → A" },
                    { value: "quantityDesc", label: "Số lượng cao nhất" },
                    { value: "quantityAsc", label: "Sắp hết trước" },
                ]} />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedStocks.map((item) => (
                    <div
                        key={item.stockId}
                        onClick={() => onViewDetail?.(item)}
                        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                        {/* Image Header */}
                        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                                    <ImageIcon size={40} className="mb-2 opacity-50" />
                                    <span className="text-xs font-medium uppercase tracking-wider opacity-60">Không có ảnh</span>
                                </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                            
                            {/* Status Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                <span className={`rounded-full border px-2 py-1 text-xs font-semibold backdrop-blur-sm ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.MATERIAL}`}>
                                    {CATEGORY_LABELS[item.category] ?? item.category ?? "Khác"}
                                </span>

                                {item.lowStock ? (
                                    <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-600 shadow-sm">
                                        <AlertTriangle size={12} />
                                        Sắp hết
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-[#006948] shadow-sm">
                                        <CheckCircle size={12} />
                                        Mức ổn
                                    </span>
                                )}
                            </div>
                            
                            {/* Title inside Image */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="line-clamp-2 text-base font-bold text-white drop-shadow-md" title={item.productName}>
                                    {item.productName}
                                </h3>
                            </div>
                        </div>

                        {/* Body Details */}
                        <div className="flex flex-1 flex-col p-5">
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                                    <span>Lượng tồn kho</span>
                                    <span>Ngưỡng thấp: {formatQuantity(item.minimumStockGrams, item.storageUnit)}</span>
                                </div>
                                
                                {/* Visual progress bar representation (optional) */}
                                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
                                    <div 
                                        className={`h-full rounded-full ${item.lowStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: item.lowStock ? '20%' : '80%' }}
                                    ></div>
                                </div>

                                <p className={`text-xl font-bold ${item.lowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {formatQuantity(item.quantityGrams, item.storageUnit)}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                    <span>Dự kiến sau duyệt</span>
                                    <span className="font-semibold text-slate-700">
                                        {formatQuantity(item.projectedQuantityGrams ?? item.quantityGrams, item.storageUnit)}
                                    </span>
                                </div>
                                {item.pendingOutboundGrams > 0 && (
                                    <div className="mt-1 text-[11px] text-amber-600">
                                        Đã giữ chỗ xuất: {formatQuantity(item.pendingOutboundGrams, item.storageUnit)}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Giá trị ước tính</span>
                                    <span className="text-sm font-bold text-slate-900">{formatMoney(item.inventoryValue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <Pagination
                page={pageInfo?.number}
                totalPages={pageInfo?.totalPages}
                totalElements={pageInfo?.totalElements}
                pageSize={pageInfo?.size}
                itemCount={stocks.length}
                loading={loading}
                onPageChange={onPageChange}
            />
        </div>
    );
}
