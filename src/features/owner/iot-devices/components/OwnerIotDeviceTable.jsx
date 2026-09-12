import { useMemo, useState } from "react";
import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";
import Pagination from "../../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../../components/common/sort/SortSelect";
import { sortItems } from "../../../../utils/listSort";

const STATUS_LABELS = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Đã tắt",
    LOST: "Mất kết nối",
    BROKEN: "Hư hỏng",
    UNASSIGNED: "Chưa gắn farm",
};

const STATUS_CLASSES = {
    ACTIVE: "bg-[#006948] text-white",
    INACTIVE: "bg-slate-200 text-slate-600",
    LOST: "bg-red-50 text-red-600",
    BROKEN: "bg-red-100 text-red-700",
    UNASSIGNED: "bg-amber-50 text-amber-700",
};

function formatDateTime(value) {
    if (!value) return "Chưa có";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function StatusBadge({ status }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                STATUS_CLASSES[status] ?? "bg-slate-100 text-slate-600",
            ].join(" ")}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function DeviceTypeBadge({ type }) {
    return (
        <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
            {type || "Chưa có"}
        </span>
    );
}

export function OwnerIotDeviceTable({
                                        devices,
                                        pageInfo,
                                        loading = false,
                                        onPageChange,
                                        onViewDetail,
                                    }) {
    const [sortKey, setSortKey] = useState("createdDesc");
    const sortedDevices = useMemo(() => sortItems(devices, sortKey, {
        createdDesc: { value: (item) => new Date(item.createdAt || 0).getTime(), direction: "desc" },
        createdAsc: { value: (item) => new Date(item.createdAt || 0).getTime(), direction: "asc" },
        nameAsc: { value: (item) => item.deviceName || item.deviceId, direction: "asc" },
        status: { value: (item) => item.status, direction: "asc" },
        lastSeenDesc: { value: (item) => new Date(item.lastSeenAt || 0).getTime(), direction: "desc" },
    }), [devices, sortKey]);

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">Danh sách thiết bị của farm</h2>
                    <SortSelect value={sortKey} onChange={setSortKey} options={[
                        { value: "createdDesc", label: "Mới tạo trước" },
                        { value: "createdAsc", label: "Cũ nhất trước" },
                        { value: "nameAsc", label: "Tên thiết bị A → Z" },
                        { value: "status", label: "Theo trạng thái" },
                        { value: "lastSeenDesc", label: "Hoạt động gần đây" },
                    ]} />
                </div>

                <p className="mt-1 text-xs text-slate-600">
                    Theo dõi trạng thái thật của thiết bị và gửi lệnh chuyển chế độ làm việc
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3">Device ID</th>
                                <th className="px-5 py-3">Tên thiết bị</th>
                                <th className="px-5 py-3">Loại</th>
                                <th className="px-5 py-3">Kết nối</th>
                                <th className="px-5 py-3">Last seen</th>
                                <th className="w-[100px] px-5 py-3 text-left">
                                    Chi tiết
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {sortedDevices.map((item) => (
                                <tr
                                    key={item.deviceId}
                                    className="border-t border-slate-200 text-sm text-slate-700"
                                >
                                    <td className="max-w-[190px] px-5 py-4 font-semibold text-slate-900">
                                        <div className="break-all">
                                            {item.deviceId}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.deviceName || (
                                            <span className="italic text-slate-400">
                                                Chưa đặt tên
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <DeviceTypeBadge type={item.deviceType} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge status={item.status} />
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatDateTime(item.lastSeenAt)}
                                    </td>


                                    <td className="w-[100px] px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetail?.(item)}
                                            className="inline-flex h-8 w-[84px] items-center justify-center rounded-lg px-3 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006948]/30"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {devices.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Farm chưa có thiết bị IoT nào.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        page={pageInfo?.number}
                        totalPages={pageInfo?.totalPages}
                        totalElements={pageInfo?.totalElements}
                        pageSize={pageInfo?.size}
                        itemCount={devices.length}
                        loading={loading}
                        onPageChange={onPageChange}
                    />
                </>
            )}
        </section>
    );
}
