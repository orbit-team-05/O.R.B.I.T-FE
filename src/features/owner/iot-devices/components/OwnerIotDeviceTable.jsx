import { PlayCircle, Power, XCircle } from "lucide-react";

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

const WORK_MODE_LABELS = {
    IDLE: "Chờ lệnh",
    IMPORT: "Nhập kho",
    EXPORT: "Xuất kho",
    HARVEST: "Thu hoạch",
};

const WORK_MODE_CLASSES = {
    IDLE: "bg-slate-100 text-slate-600",
    IMPORT: "bg-emerald-50 text-[#006948]",
    EXPORT: "bg-blue-50 text-blue-700",
    HARVEST: "bg-orange-50 text-orange-700",
};

const COMMAND_STATUS_LABELS = {
    NONE: "Không có lệnh",
    PENDING: "Chờ IoT xác nhận",
    ACKED: "Đã xác nhận",
    FAILED: "Thất bại",
    TIMEOUT: "Quá hạn",
};

const COMMAND_STATUS_CLASSES = {
    NONE: "bg-slate-100 text-slate-600",
    PENDING: "bg-amber-50 text-amber-700",
    ACKED: "bg-emerald-50 text-[#006948]",
    FAILED: "bg-red-50 text-red-600",
    TIMEOUT: "bg-red-50 text-red-600",
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

function WorkModeBadge({ mode }) {
    const safeMode = mode || "IDLE";

    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                WORK_MODE_CLASSES[safeMode] ?? "bg-slate-100 text-slate-600",
            ].join(" ")}
        >
            {WORK_MODE_LABELS[safeMode] ?? safeMode}
        </span>
    );
}

function CommandStatusBadge({ status }) {
    const safeStatus = status || "NONE";

    return (
        <span
            className={[
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                COMMAND_STATUS_CLASSES[safeStatus] ?? "bg-slate-100 text-slate-600",
            ].join(" ")}
        >
            {COMMAND_STATUS_LABELS[safeStatus] ?? safeStatus}
        </span>
    );
}

function PendingModeText({ device }) {
    if (device?.commandStatus !== "PENDING" || !device?.pendingWorkMode) {
        return <span className="text-slate-400">Không có</span>;
    }

    return (
        <div className="space-y-1">
            <WorkModeBadge mode={device.pendingWorkMode} />

            <p className="text-[11px] text-amber-700">
                Đang chờ thiết bị nhận lệnh
            </p>
        </div>
    );
}

function canStartHarvest(device) {
    return (
        canControlDevice(device) &&
        device?.workMode !== "HARVEST"
    );
}

function canCancelPendingCommand(device) {
    return (
        device?.status === "ACTIVE" &&
        device?.deviceType === "ESP32_CAM_SCALE" &&
        device?.commandStatus === "PENDING"
    );
}

function canControlDevice(device) {
    return (
        device?.status === "ACTIVE" &&
        device?.deviceType === "ESP32_CAM_SCALE" &&
        device?.commandStatus !== "PENDING"
    );
}

function canStartExport(device) {
    return (
        canControlDevice(device) &&
        device?.workMode !== "EXPORT"
    );
}

function canStartImport(device) {
    return (
        canControlDevice(device) &&
        device?.workMode !== "IMPORT"
    );
}

function canStopDevice(device) {
    return (
        canControlDevice(device) &&
        device?.workMode !== "IDLE"
    );
}

export function OwnerIotDeviceTable({
                                        devices,
                                        pageInfo,
                                        loading = false,
                                        actionLoading = false,
                                        onPageChange,
                                        onViewDetail,
                                        onStartImportMode,
                                        onStartExportMode,
                                        onStopDeviceMode,
                                        onStartHarvestMode,
                                        onCancelPendingCommand,
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
                    Theo dõi trạng thái thật của thiết bị và gửi lệnh chuyển chế độ làm việc
                </p>
            </header>

            {loading ? (
                <TableLoadingOverlay />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1320px] border-collapse text-left">
                            <thead className="bg-slate-50">
                            <tr className="text-[11px] font-medium uppercase text-slate-600">
                                <th className="px-5 py-3">Device ID</th>
                                <th className="px-5 py-3">Tên thiết bị</th>
                                <th className="px-5 py-3">Loại</th>
                                <th className="px-5 py-3">Kết nối</th>
                                <th className="px-5 py-3">Mode thật</th>
                                <th className="px-5 py-3">Lệnh chờ</th>
                                <th className="px-5 py-3">Command</th>
                                <th className="px-5 py-3">Last seen</th>
                                <th className="w-[220px] px-5 py-3 text-left">
                                    Điều khiển
                                </th>
                                <th className="w-[100px] px-5 py-3 text-left">
                                    Chi tiết
                                </th>
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
                                        <WorkModeBadge mode={item.workMode} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <PendingModeText device={item} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="space-y-1">
                                            <CommandStatusBadge status={item.commandStatus} />

                                            <p className="text-[11px] text-slate-500">
                                                Version: {item.commandVersion ?? 0}
                                            </p>

                                            {item.lastAckCommandVersion ? (
                                                <p className="text-[11px] text-slate-500">
                                                    ACK: {item.lastAckCommandVersion}
                                                </p>
                                            ) : null}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatDateTime(item.lastSeenAt)}
                                    </td>

                                    <td className="w-[220px] px-5 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    !canStartImport(item)
                                                }
                                                onClick={() => onStartImportMode?.(item)}
                                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#006948] px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <PlayCircle size={14} />
                                                Bắt đầu nhập
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    !canStartExport(item)
                                                }
                                                onClick={() => onStartExportMode?.(item)}
                                                className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Bắt đầu xuất
                                            </button>
                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    !canStartHarvest(item)
                                                }
                                                onClick={() => onStartHarvestMode?.(item)}
                                                className="inline-flex h-8 items-center justify-center rounded-lg bg-orange-600 px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Thu hoạch
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    !canStopDevice(item)
                                                }
                                                onClick={() => onStopDeviceMode?.(item)}
                                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Power size={14} />
                                                Dừng
                                            </button>
                                            {item.commandStatus === "PENDING" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading ||
                                                        !canCancelPendingCommand(item)
                                                    }
                                                    onClick={() => onCancelPendingCommand?.(item)}
                                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <XCircle size={14} />
                                                    Hủy lệnh
                                                </button>
                                            )}
                                        </div>

                                        {item.commandStatus === "PENDING" && (
                                            <p className="mt-2 text-[11px] text-amber-700">
                                                Đang chờ IoT poll và ACK lệnh.
                                            </p>
                                        )}

                                        {item.commandStatus === "FAILED" && (
                                            <p className="mt-2 text-[11px] text-red-600">
                                                {item.commandErrorMessage || "Thiết bị không áp dụng được lệnh."}
                                            </p>
                                        )}
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
                                        colSpan={10}
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