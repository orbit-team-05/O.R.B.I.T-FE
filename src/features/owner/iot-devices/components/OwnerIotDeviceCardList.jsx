import { Server, Scale, Cpu } from "lucide-react";

const STATUS_LABELS = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Đã tắt",
    LOST: "Mất kết nối",
    BROKEN: "Hư hỏng",
    UNASSIGNED: "Chưa gắn farm",
};

const STATUS_CLASSES = {
    ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
    INACTIVE: "bg-slate-50 text-slate-600 border-slate-200",
    LOST: "bg-red-50 text-red-600 border-red-200",
    BROKEN: "bg-red-100 text-red-700 border-red-300",
    UNASSIGNED: "bg-amber-50 text-amber-700 border-amber-200",
};

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold tracking-wide uppercase ${
                STATUS_CLASSES[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
            }`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export function OwnerIotDeviceCardList({
    devices = [],
    pageInfo,
    loading = false,
    onViewDetail,
    onPageChange,
}) {
    if (loading && devices.length === 0) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="h-[280px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                    />
                ))}
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
                {devices.map((item) => (
                    <div
                        key={item.deviceId}
                        onClick={() => onViewDetail?.(item)}
                        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                        {/* Header Banner */}
                        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                            {/* Decorative background circle */}
                            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white opacity-5 transition-transform duration-500 group-hover:scale-150"></div>
                            
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <Server size={80} />
                            </div>
                            
                            <div className="absolute top-4 right-4">
                                <StatusBadge status={item.status} />
                            </div>
                            
                            <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-300 drop-shadow-sm">
                                    {item.deviceId}
                                </p>
                                <h3 className="mt-1 truncate text-lg font-bold text-white drop-shadow-md" title={item.deviceName}>
                                    {item.deviceName}
                                </h3>
                            </div>
                        </div>

                        {/* Body Details */}
                        <div className="flex flex-1 flex-col p-5">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Cpu size={14} className="text-slate-400" />
                                        Loại thiết bị
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 border border-slate-200">
                                            Cân điện tử
                                        </span>
                                    </p>
                                </div>
                                <div className="border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <Scale size={14} className="text-slate-400" />
                                        Khối lượng cuối
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100">
                                        {item.lastWeightGrams == null ? "Chưa có dữ liệu" : `${item.lastWeightGrams} g`}
                                    </p>
                                </div>
                            </div>
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
