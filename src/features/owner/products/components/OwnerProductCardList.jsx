import { Image, Box, Calendar } from "lucide-react";

const CATEGORY_LABELS = {
    FEED: "Thức ăn",
    MEDICINE: "Thuốc thú y",
    CHEMICAL: "Hóa chất",
    MATERIAL: "Vật tư khác",
    HARVEST_PRODUCT: "Sản phẩm thu hoạch",
};

const CATEGORY_COLORS = {
    FEED: "bg-amber-50 text-amber-600 border-amber-200",
    MEDICINE: "bg-blue-50 text-blue-600 border-blue-200",
    CHEMICAL: "bg-purple-50 text-purple-600 border-purple-200",
    MATERIAL: "bg-slate-50 text-slate-600 border-slate-200",
};

function formatDateTime(value) {
    if (!value) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

function formatNumber(value) {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
}

export function OwnerProductCardList({
    products = [],
    pageInfo,
    loading = false,
    onViewDetail,
    onPageChange,
}) {
    if (loading && products.length === 0) {
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

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <Box size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Chưa có sản phẩm nào</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Sản phẩm dùng cho kho, keypad, QR và nhận diện IoT.
                </p>
            </div>
        );
    }

    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((item) => (
                    <div
                        key={item.id}
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
                                    <Image size={40} className="mb-2 opacity-50" />
                                    <span className="text-xs font-medium uppercase tracking-wider opacity-60">Không có ảnh</span>
                                </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                            
                            {/* Badges */}
                            <div className="absolute right-3 top-3 flex items-center gap-2">
                                <span className={`rounded-full border px-2 py-1 text-xs font-semibold backdrop-blur-sm ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.MATERIAL}`}>
                                    {CATEGORY_LABELS[item.category] ?? item.category ?? "Khác"}
                                </span>
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.status === "INACTIVE" ? "bg-slate-200/90 text-slate-600" : "bg-emerald-100/90 text-emerald-700"}`}>
                                    {item.status === "INACTIVE" ? "Ngừng" : "Đang dùng"}
                                </span>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Box size={14} className="text-emerald-500" />
                                        Tồn tối thiểu
                                    </div>
                                    <p className="mt-1 text-sm font-bold text-emerald-600">
                                        {formatNumber(item.minimumStockQuantity ?? item.minimumStockGrams)}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Calendar size={14} className="text-blue-500" />
                                        Ngày tạo
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatDateTime(item.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 truncate text-xs font-medium text-slate-500" title={item.productCode}>
                                Mã: <span className="font-semibold text-slate-700">{item.productCode || "Chưa có"}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                    <p className="text-sm text-slate-600">
                        Hiển thị trang <span className="font-bold text-slate-900">{currentPage + 1}</span> trên tổng số <span className="font-bold text-slate-900">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={isFirstPage || loading}
                            onClick={() => onPageChange?.(currentPage - 1)}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Trang trước
                        </button>
                        <button
                            type="button"
                            disabled={isLastPage || loading}
                            onClick={() => onPageChange?.(currentPage + 1)}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
