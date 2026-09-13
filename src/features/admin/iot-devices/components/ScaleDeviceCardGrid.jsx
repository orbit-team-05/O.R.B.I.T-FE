import {
    Activity,
    Clock3,
    Eye,
    MapPin,
    Plus,
    Scale,
    Wifi,
    WifiOff,
} from "lucide-react";
import Pagination from "../../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../../components/common/sort/SortSelect";

const STATUS_META = {
    UNCREATED: {
        label: "Thiết bị chưa tạo",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    UNASSIGNED: {
        label: "Chưa gắn Farm",
        className: "bg-orange-50 text-orange-700 ring-orange-200",
    },
    ACTIVE: {
        label: "Đang hoạt động",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    INACTIVE: {
        label: "Đã tắt",
        className: "bg-slate-100 text-slate-600 ring-slate-200",
    },
    LOST: {
        label: "Mất kết nối",
        className: "bg-red-50 text-red-700 ring-red-200",
    },
    BROKEN: {
        label: "Hư hỏng",
        className: "bg-red-50 text-red-700 ring-red-200",
    },
};

function formatDate(value) {
    if (!value) return "Chưa có dữ liệu";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function StatusBadge({ status }) {
    const meta = STATUS_META[status] ?? STATUS_META.INACTIVE;

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${meta.className}`}>
            {meta.label}
        </span>
    );
}

function DeviceImage({ device }) {
    return device.imageUrl ? (
        <img
            src={device.imageUrl}
            alt={device.deviceName || "Thiết bị cân"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
    ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100">
            <Scale className="h-12 w-12 text-[#006948]/60" strokeWidth={1.4} />
        </div>
    );
}

function DeviceCard({
    device,
    view,
    onCreate,
    onViewDetail,
    onToggleStatus,
}) {
    const uncreated = view === "UNCREATED";
    const nextStatus = device.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
            <div className="relative h-40 overflow-hidden bg-slate-100">
                <DeviceImage device={device} />
                <div className="absolute left-3 top-3">
                    <StatusBadge status={device.status} />
                </div>
                {device.status === "ACTIVE" && (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-emerald-600 shadow-sm">
                        <Wifi size={15} />
                    </div>
                )}
                {device.status === "LOST" && (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm">
                        <WifiOff size={15} />
                    </div>
                )}
            </div>

            <div className="space-y-4 p-4">
                <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900">
                        {uncreated ? "Địa chỉ MAC mới" : device.deviceName || "Thiết bị cân chưa đặt tên"}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs font-semibold tracking-wide text-[#006948]">
                        {device.macAddress}
                    </p>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                    {!uncreated && (
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="shrink-0 text-slate-400" />
                            <span className="truncate">{device.farmName || "Chưa gắn Farm"}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Clock3 size={14} className="shrink-0 text-slate-400" />
                        <span className="truncate">
                            {uncreated ? `Phát hiện ${formatDate(device.createdAt)}` : `Cập nhật ${formatDate(device.updatedAt)}`}
                        </span>
                    </div>
                    {!uncreated && device.lastWeightGrams != null && (
                        <div className="flex items-center gap-2 text-[#006948]">
                            <Activity size={14} className="shrink-0" />
                            <span>Khối lượng cuối: {device.lastWeightGrams} g</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                    {uncreated ? (
                        <button
                            type="button"
                            onClick={() => onCreate?.(device)}
                            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#006948] px-3 text-xs font-bold text-white transition hover:bg-[#00583d]"
                        >
                            <Plus size={15} />
                            Tạo thiết bị cân
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => onViewDetail?.(device)}
                                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <Eye size={15} />
                                Chi tiết & log
                            </button>
                            {(device.status === "ACTIVE" || device.status === "INACTIVE") && (
                                <button
                                    type="button"
                                    onClick={() => onToggleStatus?.(device, nextStatus)}
                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-[#006948]"
                                >
                                    {device.status === "ACTIVE" ? "Tắt" : "Bật"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

export function ScaleDeviceCardGrid({
    devices,
    view,
    pageInfo,
    loading = false,
    onPageChange,
    onCreate,
    onViewDetail,
    onToggleStatus,
    sortKey = "createdDesc",
    onSortChange,
}) {

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        {view === "UNCREATED" ? "Thiết bị chưa tạo" : view === "UNASSIGNED" ? "Thiết bị chưa gắn Farm" : "Danh sách thiết bị cân"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        {view === "UNCREATED" ? "Các địa chỉ MAC đang chờ Admin tạo thiết bị cân." : "Các thiết bị cân được quản lý trong hệ thống."}
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <SortSelect value={sortKey} onChange={onSortChange} options={[
                        { value: "createdDesc", label: "Mới tạo trước" },
                        { value: "createdAsc", label: "Cũ nhất trước" },
                        { value: "nameAsc", label: "Tên/MAC A → Z" },
                        { value: "status", label: "Theo trạng thái" },
                    ]} />
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                        {pageInfo.totalElements ?? 0} thiết bị
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => <div key={item} className="h-[360px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)}
                </div>
            ) : devices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <Scale className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.4} />
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                        {view === "UNCREATED" ? "Chưa có MAC nào đang chờ tạo." : "Chưa có thiết bị cân để hiển thị."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {devices.map((device) => (
                        <DeviceCard
                            key={device.id || device.deviceId || device.macAddress}
                            device={device}
                            view={view}
                            onCreate={onCreate}
                            onViewDetail={onViewDetail}
                            onToggleStatus={onToggleStatus}
                        />
                    ))}
                </div>
            )}

            <Pagination
                page={pageInfo.number}
                totalPages={pageInfo.totalPages}
                totalElements={pageInfo.totalElements}
                pageSize={pageInfo.size}
                loading={loading}
                onPageChange={onPageChange}
            />
        </section>
    );
}
