import { TableLoadingOverlay } from "../../../../components/common/table/TableLoadingOverlay";

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
    const currentPage = Math.max(Number(pageInfo?.number ?? 0), 0);
    const totalPages = Math.max(Number(pageInfo?.totalPages ?? 1), 1);
    const isFirstPage = currentPage <= 0 || pageInfo?.first;
    const isLastPage = currentPage >= totalPages - 1 || pageInfo?.last;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                    Danh sách thiết bị của farm
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Thiết bị đã được kích hoạt và gắn với farm hiện tại
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3">Device ID</th>
                                <th className="px-5 py-3">Tên thiết bị</th>
                                <th className="px-5 py-3">Loại</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3">Last seen</th>
                                <th className="px-5 py-3">Activated at</th>
                                <th className="w-[140px] px-5 py-3 text-left">Hành động</th>
                            </tr>
                            </thead>

                            <tbody>
                            {devices.map((item) => (
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

                                    <td className="px-5 py-4">
                                        {formatDateTime(item.activatedAt)}
                                    </td>

                                    <td className="w-[140px] px-5 py-4">
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
                                        colSpan={7}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Farm chưa có thiết bị IoT nào.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Tổng {pageInfo.totalElements} thiết bị
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isFirstPage}
                                onClick={() => {
                                    if (isFirstPage) return;
                                    onPageChange(currentPage - 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Trước
                            </button>

                            <span className="text-xs text-slate-600">
                                Trang {currentPage + 1} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={isLastPage}
                                onClick={() => {
                                    if (isLastPage) return;
                                    onPageChange(currentPage + 1);
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Sau
                            </button>
                        </div>
                    </footer>
                </>
            )}
        </section>
    );
}